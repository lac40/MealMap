package com.mealmap.service;

import com.mealmap.model.dto.dashboard.DashboardStatsDto;
import com.mealmap.model.entity.Household;
import com.mealmap.model.entity.User;
import com.mealmap.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Tests")
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private PlannerWeekRepository plannerWeekRepository;

    @Mock
    private PantryItemRepository pantryItemRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private DashboardService dashboardService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");

        // Setup security context
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("test@example.com");
        lenient().when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("Should get dashboard stats for user without household")
    void shouldGetDashboardStatsForUserWithoutHousehold() {
        // Given
        testUser.setHousehold(null);

        when(ingredientRepository.countByOwnerUserId(userId)).thenReturn(5L);
        when(recipeRepository.countByOwnerUserId(userId)).thenReturn(10L);
        when(pantryItemRepository.countByUserId(userId)).thenReturn(15L);
        when(plannerWeekRepository.countPlannerItemsByUserIdAndDateRange(
                eq(userId), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(8L, 12L); // First for current week, second for upcoming

        // When
        DashboardStatsDto stats = dashboardService.getDashboardStats();

        // Then
        assertThat(stats).isNotNull();
        assertThat(stats.getIngredientsCount()).isEqualTo(5L);
        assertThat(stats.getRecipesCount()).isEqualTo(10L);
        assertThat(stats.getPantryItemsCount()).isEqualTo(15L);
        assertThat(stats.getPlannedMealsCount()).isEqualTo(8L); // Current week
        assertThat(stats.getUpcomingMealsCount()).isEqualTo(12L); // Upcoming

        verify(ingredientRepository).countByOwnerUserId(userId);
        verify(recipeRepository).countByOwnerUserId(userId);
        verify(pantryItemRepository).countByUserId(userId);
        verify(plannerWeekRepository, times(2)).countPlannerItemsByUserIdAndDateRange(
                eq(userId), any(LocalDate.class), any(LocalDate.class)
        );

        // Verify household methods were not called
        verify(ingredientRepository, never()).countByOwnerUserIdOrOwnerUserHouseholdId(any(), any());
        verify(recipeRepository, never()).countByOwnerUserIdOrOwnerUserHouseholdId(any(), any());
        verify(pantryItemRepository, never()).countByUserOrHouseholds(any(), anyList());
    }

    @Test
    @DisplayName("Should get dashboard stats for user with household")
    void shouldGetDashboardStatsForUserWithHousehold() {
        // Given
        UUID householdId = UUID.randomUUID();
        Household household = new Household();
        household.setId(householdId);
        household.setName("Test Household");
        testUser.setHousehold(household);

        List<UUID> householdIds = Collections.singletonList(householdId);

        when(ingredientRepository.countByOwnerUserIdOrOwnerUserHouseholdId(userId, householdId)).thenReturn(20L);
        when(recipeRepository.countByOwnerUserIdOrOwnerUserHouseholdId(userId, householdId)).thenReturn(25L);
        when(pantryItemRepository.countByUserOrHouseholds(userId, householdIds)).thenReturn(30L);
        when(plannerWeekRepository.countPlannerItemsByUserOrHouseholdsAndDateRange(
                eq(userId), eq(householdIds), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(18L, 22L); // First for current week, second for upcoming

        // When
        DashboardStatsDto stats = dashboardService.getDashboardStats();

        // Then
        assertThat(stats).isNotNull();
        assertThat(stats.getIngredientsCount()).isEqualTo(20L);
        assertThat(stats.getRecipesCount()).isEqualTo(25L);
        assertThat(stats.getPantryItemsCount()).isEqualTo(30L);
        assertThat(stats.getPlannedMealsCount()).isEqualTo(18L);
        assertThat(stats.getUpcomingMealsCount()).isEqualTo(22L);

        verify(ingredientRepository).countByOwnerUserIdOrOwnerUserHouseholdId(userId, householdId);
        verify(recipeRepository).countByOwnerUserIdOrOwnerUserHouseholdId(userId, householdId);
        verify(pantryItemRepository).countByUserOrHouseholds(userId, householdIds);
        verify(plannerWeekRepository, times(2)).countPlannerItemsByUserOrHouseholdsAndDateRange(
                eq(userId), eq(householdIds), any(LocalDate.class), any(LocalDate.class)
        );

        // Verify single-user methods were not called
        verify(ingredientRepository, never()).countByOwnerUserId(any());
        verify(recipeRepository, never()).countByOwnerUserId(any());
        verify(pantryItemRepository, never()).countByUserId(any());
    }

    @Test
    @DisplayName("Should handle zero counts correctly")
    void shouldHandleZeroCountsCorrectly() {
        // Given
        testUser.setHousehold(null);

        when(ingredientRepository.countByOwnerUserId(userId)).thenReturn(0L);
        when(recipeRepository.countByOwnerUserId(userId)).thenReturn(0L);
        when(pantryItemRepository.countByUserId(userId)).thenReturn(0L);
        when(plannerWeekRepository.countPlannerItemsByUserIdAndDateRange(
                any(), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(0L);

        // When
        DashboardStatsDto stats = dashboardService.getDashboardStats();

        // Then
        assertThat(stats).isNotNull();
        assertThat(stats.getIngredientsCount()).isZero();
        assertThat(stats.getRecipesCount()).isZero();
        assertThat(stats.getPantryItemsCount()).isZero();
        assertThat(stats.getPlannedMealsCount()).isZero();
        assertThat(stats.getUpcomingMealsCount()).isZero();
    }

    @Test
    @DisplayName("Should use correct date ranges for current week and upcoming")
    void shouldUseCorrectDateRangesForCurrentWeekAndUpcoming() {
        // Given
        testUser.setHousehold(null);
        LocalDate today = LocalDate.now();
        LocalDate currentWeekStart = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate currentWeekEnd = currentWeekStart.plusDays(6);
        LocalDate upcomingEnd = today.plusDays(6);

        when(ingredientRepository.countByOwnerUserId(userId)).thenReturn(0L);
        when(recipeRepository.countByOwnerUserId(userId)).thenReturn(0L);
        when(pantryItemRepository.countByUserId(userId)).thenReturn(0L);
        when(plannerWeekRepository.countPlannerItemsByUserIdAndDateRange(
                any(), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(0L);

        // When
        dashboardService.getDashboardStats();

        // Then
        // Verify correct date ranges are used (at least)
        verify(plannerWeekRepository, atLeastOnce()).countPlannerItemsByUserIdAndDateRange(
                eq(userId), any(LocalDate.class), any(LocalDate.class)
        );
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> dashboardService.getDashboardStats())
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    @DisplayName("Should handle large counts correctly")
    void shouldHandleLargeCountsCorrectly() {
        // Given
        testUser.setHousehold(null);

        when(ingredientRepository.countByOwnerUserId(userId)).thenReturn(1000L);
        when(recipeRepository.countByOwnerUserId(userId)).thenReturn(5000L);
        when(pantryItemRepository.countByUserId(userId)).thenReturn(10000L);
        when(plannerWeekRepository.countPlannerItemsByUserIdAndDateRange(
                any(), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(50L, 100L);

        // When
        DashboardStatsDto stats = dashboardService.getDashboardStats();

        // Then
        assertThat(stats).isNotNull();
        assertThat(stats.getIngredientsCount()).isEqualTo(1000L);
        assertThat(stats.getRecipesCount()).isEqualTo(5000L);
        assertThat(stats.getPantryItemsCount()).isEqualTo(10000L);
    }
}
