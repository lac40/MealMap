package com.mealmap.service;

import com.mealmap.model.entity.User;
import com.mealmap.model.dto.dashboard.DashboardStatsDto;
import com.mealmap.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;
    private final PlannerWeekRepository plannerWeekRepository;
    private final PantryItemRepository pantryItemRepository;

    public DashboardStatsDto getDashboardStats() {
        User currentUser = getCurrentUser();
        UUID householdId = currentUser.getHousehold() != null ? currentUser.getHousehold().getId() : null;
        List<UUID> householdIds = householdId != null ? Collections.singletonList(householdId) : Collections.emptyList();

        // Count ingredients (user only for now)
        long ingredientsCount = ingredientRepository.countByOwnerUserId(currentUser.getId());

        // Count recipes (user only for now)
        long recipesCount = recipeRepository.countByOwnerUserId(currentUser.getId());

        // Count pantry items (user + household)
        long pantryItemsCount;
        if (householdId != null) {
            pantryItemsCount = pantryItemRepository.countByUserOrHouseholds(currentUser.getId(), householdIds);
        } else {
            pantryItemsCount = pantryItemRepository.countByUserId(currentUser.getId());
        }

        // Count planned meals for current week (Mon-Sun)
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);
        
        long plannedMealsCount;
        if (householdId != null) {
            plannedMealsCount = plannerWeekRepository.countPlannerItemsByUserOrHouseholdsAndDateRange(
                currentUser.getId(), householdIds, weekStart, weekEnd);
        } else {
            plannedMealsCount = plannerWeekRepository.countPlannerItemsByUserIdAndDateRange(
                currentUser.getId(), weekStart, weekEnd);
        }

        // Count upcoming meals (next 7 days)
        LocalDate upcomingStart = today;
        LocalDate upcomingEnd = today.plusDays(6);
        
        long upcomingMealsCount;
        if (householdId != null) {
            upcomingMealsCount = plannerWeekRepository.countPlannerItemsByUserOrHouseholdsAndDateRange(
                currentUser.getId(), householdIds, upcomingStart, upcomingEnd);
        } else {
            upcomingMealsCount = plannerWeekRepository.countPlannerItemsByUserIdAndDateRange(
                currentUser.getId(), upcomingStart, upcomingEnd);
        }

        return DashboardStatsDto.builder()
                .ingredientsCount(ingredientsCount)
                .recipesCount(recipesCount)
                .plannedMealsCount(plannedMealsCount)
                .pantryItemsCount(pantryItemsCount)
                .upcomingMealsCount(upcomingMealsCount)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
