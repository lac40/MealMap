package com.mealmap.service;

import com.mealmap.exception.ResourceNotFoundException;
import com.mealmap.exception.UnauthorizedException;
import com.mealmap.mapper.PlannerMapper;
import com.mealmap.model.dto.planner.*;
import com.mealmap.model.entity.*;
import com.mealmap.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlannerService {

    private final PlannerWeekRepository plannerWeekRepository;
    private final PlannerItemRepository plannerItemRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final PlannerMapper plannerMapper;

    @Transactional(readOnly = true)
    public PlannerWeekPageResponse getPlannersWeeks(LocalDate from, LocalDate to, Integer limit, String cursor) {
        User currentUser = getCurrentUser();
        
        // Get user's households
        List<UUID> householdIds = new ArrayList<>();
        if (currentUser.getHousehold() != null) {
            householdIds.add(currentUser.getHousehold().getId());
        }

        List<PlannerWeek> weeks = plannerWeekRepository.findByUserOrHouseholdsAndDateRange(
                currentUser.getId(),
                householdIds,
                from,
                to
        );

        // Apply limit if provided
        if (limit != null && limit > 0 && weeks.size() > limit) {
            weeks = weeks.subList(0, limit);
        }

        List<PlannerWeekDto> dtos = weeks.stream()
                .map(plannerMapper::toDto)
                .collect(Collectors.toList());

        return PlannerWeekPageResponse.builder()
                .data(dtos)
                .nextCursor(null) // Simple implementation without cursor pagination
                .build();
    }

    @Transactional(readOnly = true)
    public PlannerWeekDto getPlannerWeekById(UUID id) {
        PlannerWeek plannerWeek = plannerWeekRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Planner week not found with id: " + id));

        // Check access permissions
        User currentUser = getCurrentUser();
        if (!hasAccessToPlannerWeek(plannerWeek, currentUser)) {
            throw new UnauthorizedException("You don't have access to this planner week");
        }

        return plannerMapper.toDto(plannerWeek);
    }

    @Transactional
    public PlannerWeekDto createPlannerWeek(CreatePlannerWeekRequest request) {
        User currentUser = getCurrentUser();

        // Validate start date is a Monday
        if (request.getStartDate().getDayOfWeek().getValue() != 1) {
            throw new IllegalArgumentException("Start date must be a Monday");
        }

        PlannerWeek plannerWeek = PlannerWeek.builder()
                .startDate(request.getStartDate())
                .items(new ArrayList<>())
                .build();

        // Set user or household
        if (request.getHouseholdId() != null) {
            // Verify user has access to household
            if (currentUser.getHousehold() == null || 
                !currentUser.getHousehold().getId().equals(request.getHouseholdId())) {
                throw new UnauthorizedException("You don't have access to this household");
            }
            plannerWeek.setHousehold(currentUser.getHousehold());
        } else {
            plannerWeek.setUser(currentUser);
        }

        // Add items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreatePlannerItemRequest itemRequest : request.getItems()) {
                PlannerItem item = createPlannerItem(itemRequest, currentUser, plannerWeek);
                plannerWeek.addItem(item);
            }
        }

        PlannerWeek savedWeek = plannerWeekRepository.save(plannerWeek);
        log.info("Created planner week with id: {}", savedWeek.getId());

        return plannerMapper.toDto(savedWeek);
    }

    @Transactional
    public PlannerWeekDto updatePlannerWeek(UUID id, UpdatePlannerWeekRequest request) {
        PlannerWeek plannerWeek = plannerWeekRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Planner week not found with id: " + id));

        User currentUser = getCurrentUser();
        if (!hasAccessToPlannerWeek(plannerWeek, currentUser)) {
            throw new UnauthorizedException("You don't have access to this planner week");
        }

        // Clear existing items
        plannerWeek.getItems().clear();

        // Add new items
        if (request.getItems() != null) {
            for (CreatePlannerItemRequest itemRequest : request.getItems()) {
                PlannerItem item = createPlannerItem(itemRequest, currentUser, plannerWeek);
                plannerWeek.addItem(item);
            }
        }

        PlannerWeek updatedWeek = plannerWeekRepository.save(plannerWeek);
        log.info("Updated planner week with id: {}", updatedWeek.getId());

        return plannerMapper.toDto(updatedWeek);
    }

    @Transactional
    public void deletePlannerWeek(UUID id) {
        PlannerWeek plannerWeek = plannerWeekRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Planner week not found with id: " + id));

        User currentUser = getCurrentUser();
        if (!hasAccessToPlannerWeek(plannerWeek, currentUser)) {
            throw new UnauthorizedException("You don't have access to this planner week");
        }

        plannerWeekRepository.delete(plannerWeek);
        log.info("Deleted planner week with id: {}", id);
    }

    private PlannerItem createPlannerItem(CreatePlannerItemRequest request, User currentUser, PlannerWeek plannerWeek) {
        PlannerItem item = PlannerItem.builder()
                .date(request.getDate())
                .slot(request.getSlot())
                .portions(request.getPortions())
                .addedByUser(currentUser)
                .plannerWeek(plannerWeek)
                .build();

        // Set recipe if provided
        if (request.getRecipeId() != null) {
            Recipe recipe = recipeRepository.findById(request.getRecipeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + request.getRecipeId()));
            item.setRecipe(recipe);
        }

        return item;
    }

    private boolean hasAccessToPlannerWeek(PlannerWeek plannerWeek, User user) {
        // User owns it
        if (plannerWeek.getUser() != null && plannerWeek.getUser().getId().equals(user.getId())) {
            return true;
        }

        // User is in the household
        if (plannerWeek.getHousehold() != null && user.getHousehold() != null) {
            return plannerWeek.getHousehold().getId().equals(user.getHousehold().getId());
        }

        return false;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
