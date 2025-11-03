package com.mealmap.mapper;

import com.mealmap.model.dto.grocery.GroceryItemDto;
import com.mealmap.model.dto.grocery.GroceryListDto;
import com.mealmap.model.dto.grocery.GroceryTripDto;
import com.mealmap.model.embedded.GroceryItem;
import com.mealmap.model.embedded.GroceryTrip;
import com.mealmap.model.entity.GroceryList;
import com.mealmap.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class GroceryMapper {
    
    private final IngredientRepository ingredientRepository;
    
    public GroceryListDto toDto(GroceryList groceryList) {
        GroceryListDto dto = new GroceryListDto();
        dto.setId(groceryList.getId());
        dto.setPlanWeekId(groceryList.getPlannerWeek().getId());
        dto.setCreatedAt(groceryList.getCreatedAt());
        dto.setUpdatedAt(groceryList.getUpdatedAt());
        
        dto.setTrips(groceryList.getTrips().stream()
            .map(this::toTripDto)
            .collect(Collectors.toList()));
        
        return dto;
    }
    
    private GroceryTripDto toTripDto(GroceryTrip trip) {
        GroceryTripDto dto = new GroceryTripDto();
        dto.setTripIndex(trip.getTripIndex());
        
        GroceryTripDto.DateRangeDto dateRangeDto = new GroceryTripDto.DateRangeDto();
        dateRangeDto.setFrom(trip.getDateRange().getFrom());
        dateRangeDto.setTo(trip.getDateRange().getTo());
        dto.setDateRange(dateRangeDto);
        
        dto.setItems(trip.getItems().stream()
            .map(this::toItemDto)
            .collect(Collectors.toList()));
        
        return dto;
    }
    
    private GroceryItemDto toItemDto(GroceryItem item) {
        GroceryItemDto dto = new GroceryItemDto();
        dto.setIngredientId(item.getIngredientId());
        dto.setCategoryId(item.getCategoryId());
        dto.setNeeded(item.getNeeded());
        dto.setAfterPantry(item.getAfterPantry());
        dto.setChecked(item.isChecked());
        
        // Fetch ingredient and category names
        ingredientRepository.findById(item.getIngredientId()).ifPresent(ingredient -> {
            dto.setIngredientName(ingredient.getName());
            if (ingredient.getCategory() != null) {
                dto.setCategoryName(ingredient.getCategory().getName());
            }
        });
        
        return dto;
    }
}
