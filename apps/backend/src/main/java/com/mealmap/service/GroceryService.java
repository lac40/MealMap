package com.mealmap.service;

import com.mealmap.exception.ResourceNotFoundException;
import com.mealmap.exception.UnauthorizedException;
import com.mealmap.mapper.GroceryMapper;
import com.mealmap.model.dto.grocery.ComputeGroceryRequest;
import com.mealmap.model.dto.grocery.GroceryListDto;
import com.mealmap.model.dto.grocery.UpdateGroceryListRequest;
import com.mealmap.model.embedded.GroceryItem;
import com.mealmap.model.embedded.GroceryTrip;
import com.mealmap.model.embedded.Quantity;
import com.mealmap.model.entity.*;
import com.mealmap.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroceryService {
    
    private final GroceryListRepository groceryListRepository;
    private final PlannerWeekRepository plannerWeekRepository;
    private final PantryItemRepository pantryItemRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final GroceryMapper groceryMapper;
    
    @Transactional
    public GroceryListDto computeGroceryList(ComputeGroceryRequest request) {
        User currentUser = getCurrentUser();
        
        // Fetch planner week
        PlannerWeek plannerWeek = plannerWeekRepository.findById(request.getPlanWeekId())
            .orElseThrow(() -> new ResourceNotFoundException("Planner week not found with id: " + request.getPlanWeekId()));
        
        // Check access
        if (!hasAccessToPlannerWeek(plannerWeek, currentUser)) {
            throw new UnauthorizedException("You don't have access to this planner week");
        }
        
        // Check if grocery list already exists for this planner week
        Optional<GroceryList> existingList = groceryListRepository.findByPlanWeekIdAndUserId(
            request.getPlanWeekId(), currentUser.getId());
        
        if (existingList.isPresent()) {
            // Update existing list
            GroceryList groceryList = existingList.get();
            groceryList.getTrips().clear();
            groceryList.getTrips().addAll(computeTrips(request, plannerWeek, currentUser));
            GroceryList saved = groceryListRepository.save(groceryList);
            return groceryMapper.toDto(saved);
        } else {
            // Create new grocery list
            GroceryList groceryList = GroceryList.builder()
                .plannerWeek(plannerWeek)
                .user(plannerWeek.getUser())
                .household(plannerWeek.getHousehold())
                .trips(computeTrips(request, plannerWeek, currentUser))
                .build();
            
            GroceryList saved = groceryListRepository.save(groceryList);
            return groceryMapper.toDto(saved);
        }
    }
    
    private List<GroceryTrip> computeTrips(ComputeGroceryRequest request, PlannerWeek plannerWeek, User currentUser) {
        // Step 1: Aggregate ingredients from all planner items
        Map<UUID, IngredientAggregate> neededIngredients = aggregateIngredientsFromPlanner(plannerWeek);
        
        // Step 2: Subtract pantry items
        subtractPantryItems(neededIngredients, currentUser, plannerWeek.getHousehold());
        
        // Step 3: Split into trips based on date ranges
        List<GroceryTrip> trips = splitIntoTrips(request, plannerWeek, neededIngredients);
        
        return trips;
    }
    
    private Map<UUID, IngredientAggregate> aggregateIngredientsFromPlanner(PlannerWeek plannerWeek) {
        Map<UUID, IngredientAggregate> aggregates = new HashMap<>();
        
        for (PlannerItem plannerItem : plannerWeek.getItems()) {
            if (plannerItem.getRecipe() != null) {
                Recipe recipe = recipeRepository.findById(plannerItem.getRecipe().getId())
                    .orElse(null);
                
                if (recipe != null && recipe.getItems() != null) {
                    for (RecipeItem recipeItem : recipe.getItems()) {
                        UUID ingredientId = recipeItem.getIngredientId();
                        UUID categoryId = null; // We'll need to fetch this separately
                        
                        aggregates.putIfAbsent(ingredientId, new IngredientAggregate(ingredientId, categoryId));
                        
                        // Multiply quantity by portions
                        BigDecimal portionMultiplier = BigDecimal.valueOf(plannerItem.getPortions());
                        BigDecimal amount = recipeItem.getQuantity().getAmount().multiply(portionMultiplier);
                        com.mealmap.model.enums.Unit unit = recipeItem.getQuantity().getUnit();
                        
                        aggregates.get(ingredientId).addQuantity(amount, unit);
                    }
                }
            }
        }
        
        return aggregates;
    }
    
    private void subtractPantryItems(Map<UUID, IngredientAggregate> neededIngredients, User currentUser, Household household) {
        // Fetch pantry items for user and household
        List<PantryItem> pantryItems = new ArrayList<>();
        
        if (household != null) {
            List<UUID> householdIds = List.of(household.getId());
            pantryItems = pantryItemRepository.findByUserOrHouseholds(currentUser.getId(), householdIds);
        } else {
            pantryItems = pantryItemRepository.findByUserId(currentUser.getId());
        }
        
        for (PantryItem pantryItem : pantryItems) {
            UUID ingredientId = pantryItem.getIngredient().getId();
            if (neededIngredients.containsKey(ingredientId)) {
                neededIngredients.get(ingredientId).subtractPantry(
                    pantryItem.getQuantity().getAmount(),
                    pantryItem.getQuantity().getUnit()
                );
            }
        }
    }
    
    private List<GroceryTrip> splitIntoTrips(ComputeGroceryRequest request, PlannerWeek plannerWeek, 
                                              Map<UUID, IngredientAggregate> neededIngredients) {
        List<GroceryTrip> trips = new ArrayList<>();
        
        LocalDate weekStart = plannerWeek.getStartDate();
        LocalDate weekEnd = weekStart.plusDays(6);
        
        if ("custom".equals(request.getSplitRule()) && request.getCustomSplits() != null) {
            // Use custom splits
            for (int i = 0; i < request.getCustomSplits().size(); i++) {
                ComputeGroceryRequest.CustomSplit split = request.getCustomSplits().get(i);
                trips.add(createTrip(i, split.getFrom(), split.getTo(), neededIngredients));
            }
        } else {
            // Default: Sun-Wed and Thu-Sat split
            if (request.getTrips() == 1) {
                trips.add(createTrip(0, weekStart, weekEnd, neededIngredients));
            } else if (request.getTrips() == 2) {
                LocalDate midWeek = weekStart.plusDays(3); // Wednesday
                trips.add(createTrip(0, weekStart, midWeek, neededIngredients));
                trips.add(createTrip(1, midWeek.plusDays(1), weekEnd, neededIngredients));
            } else {
                // Split evenly across N trips
                int daysPerTrip = 7 / request.getTrips();
                for (int i = 0; i < request.getTrips(); i++) {
                    LocalDate tripStart = weekStart.plusDays(i * daysPerTrip);
                    LocalDate tripEnd = (i == request.getTrips() - 1) 
                        ? weekEnd 
                        : weekStart.plusDays((i + 1) * daysPerTrip - 1);
                    trips.add(createTrip(i, tripStart, tripEnd, neededIngredients));
                }
            }
        }
        
        return trips;
    }
    
    private GroceryTrip createTrip(int index, LocalDate from, LocalDate to, 
                                   Map<UUID, IngredientAggregate> neededIngredients) {
        GroceryTrip trip = new GroceryTrip();
        trip.setTripIndex(index);
        
        GroceryTrip.DateRange dateRange = new GroceryTrip.DateRange(from, to);
        trip.setDateRange(dateRange);
        
        // For now, add all items to first trip (can be enhanced to split by date)
        if (index == 0) {
            List<GroceryItem> items = neededIngredients.values().stream()
                .filter(agg -> agg.getAfterPantry().getAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(agg -> {
                    GroceryItem item = new GroceryItem();
                    item.setIngredientId(agg.getIngredientId());
                    item.setCategoryId(agg.getCategoryId());
                    item.setNeeded(agg.getNeeded());
                    item.setAfterPantry(agg.getAfterPantry());
                    item.setChecked(false);
                    return item;
                })
                .collect(Collectors.toList());
            trip.setItems(items);
        } else {
            trip.setItems(new ArrayList<>());
        }
        
        return trip;
    }
    
    @Transactional
    public GroceryListDto updateGroceryList(UUID id, UpdateGroceryListRequest request) {
        User currentUser = getCurrentUser();
        
        GroceryList groceryList = groceryListRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grocery list not found with id: " + id));
        
        // Check access
        if (!hasAccessToGroceryList(groceryList, currentUser)) {
            throw new UnauthorizedException("You don't have access to this grocery list");
        }
        
        // Update trips
        for (UpdateGroceryListRequest.TripUpdate tripUpdate : request.getTrips()) {
            if (tripUpdate.getTripIndex() < groceryList.getTrips().size()) {
                GroceryTrip trip = groceryList.getTrips().get(tripUpdate.getTripIndex());
                
                // Update checked status for items
                for (int i = 0; i < trip.getItems().size(); i++) {
                    if (i < tripUpdate.getItems().size()) {
                        trip.getItems().get(i).setChecked(tripUpdate.getItems().get(i).isChecked());
                    }
                }
            }
        }
        
        GroceryList saved = groceryListRepository.save(groceryList);
        return groceryMapper.toDto(saved);
    }
    
    @Transactional(readOnly = true)
    public GroceryListDto getGroceryListById(UUID id) {
        User currentUser = getCurrentUser();
        
        GroceryList groceryList = groceryListRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grocery list not found with id: " + id));
        
        if (!hasAccessToGroceryList(groceryList, currentUser)) {
            throw new UnauthorizedException("You don't have access to this grocery list");
        }
        
        return groceryMapper.toDto(groceryList);
    }
    
    private boolean hasAccessToPlannerWeek(PlannerWeek plannerWeek, User user) {
        if (plannerWeek.getUser() != null && plannerWeek.getUser().getId().equals(user.getId())) {
            return true;
        }
        if (plannerWeek.getHousehold() != null) {
            return plannerWeek.getHousehold().getMembers().stream()
                .anyMatch(member -> member.getId().equals(user.getId()));
        }
        return false;
    }
    
    private boolean hasAccessToGroceryList(GroceryList groceryList, User user) {
        if (groceryList.getUser() != null && groceryList.getUser().getId().equals(user.getId())) {
            return true;
        }
        if (groceryList.getHousehold() != null) {
            return groceryList.getHousehold().getMembers().stream()
                .anyMatch(member -> member.getId().equals(user.getId()));
        }
        return false;
    }
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
    
    // Helper class for aggregating ingredients
    private static class IngredientAggregate {
        private final UUID ingredientId;
        private final UUID categoryId;
        private Quantity needed;
        private Quantity afterPantry;
        
        public IngredientAggregate(UUID ingredientId, UUID categoryId) {
            this.ingredientId = ingredientId;
            this.categoryId = categoryId;
            this.needed = Quantity.builder()
                .amount(BigDecimal.ZERO)
                .unit(com.mealmap.model.enums.Unit.g)
                .build();
            this.afterPantry = Quantity.builder()
                .amount(BigDecimal.ZERO)
                .unit(com.mealmap.model.enums.Unit.g)
                .build();
        }
        
        public void addQuantity(BigDecimal amount, com.mealmap.model.enums.Unit unit) {
            // Simple aggregation - convert to base unit if needed
            BigDecimal converted = convertToBaseUnit(amount, unit);
            this.needed.setAmount(this.needed.getAmount().add(converted));
            this.needed.setUnit(getBaseUnit(unit));
            this.afterPantry = Quantity.builder()
                .amount(this.needed.getAmount())
                .unit(this.needed.getUnit())
                .build();
        }
        
        public void subtractPantry(BigDecimal amount, com.mealmap.model.enums.Unit unit) {
            BigDecimal converted = convertToBaseUnit(amount, unit);
            BigDecimal newAmount = this.afterPantry.getAmount().subtract(converted);
            this.afterPantry.setAmount(newAmount.max(BigDecimal.ZERO)); // Don't go negative
        }
        
        private BigDecimal convertToBaseUnit(BigDecimal amount, com.mealmap.model.enums.Unit unit) {
            // Simple conversion: kg->g, l->ml
            switch (unit) {
                case kg:
                    return amount.multiply(new BigDecimal("1000"));
                case l:
                    return amount.multiply(new BigDecimal("1000"));
                default:
                    return amount;
            }
        }
        
        private com.mealmap.model.enums.Unit getBaseUnit(com.mealmap.model.enums.Unit unit) {
            switch (unit) {
                case kg:
                case g:
                    return com.mealmap.model.enums.Unit.g;
                case l:
                case ml:
                    return com.mealmap.model.enums.Unit.ml;
                default:
                    return unit;
            }
        }
        
        public UUID getIngredientId() { return ingredientId; }
        public UUID getCategoryId() { return categoryId; }
        public Quantity getNeeded() { return needed; }
        public Quantity getAfterPantry() { return afterPantry; }
    }
}
