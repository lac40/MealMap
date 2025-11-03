package com.mealmap.service;

import com.mealmap.exception.ResourceNotFoundException;
import com.mealmap.exception.UnauthorizedException;
import com.mealmap.mapper.PlannerMapper;
import com.mealmap.model.dto.planner.*;
import com.mealmap.model.entity.*;
import com.mealmap.model.enums.MealSlot;
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
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlannerService Tests")
class PlannerServiceTest {

    @Mock
    private PlannerWeekRepository plannerWeekRepository;

    @Mock
    private PlannerItemRepository plannerItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private PlannerMapper plannerMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PlannerService plannerService;

    private User testUser;
    private Household testHousehold;
    private Recipe testRecipe;
    private PlannerWeek testPlannerWeek;
    private PlannerItem testPlannerItem;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");

        // Setup test household
        testHousehold = new Household();
        testHousehold.setId(UUID.randomUUID());
        testHousehold.setName("Test Household");

        // Setup test recipe
        testRecipe = new Recipe();
        testRecipe.setId(UUID.randomUUID());
        testRecipe.setName("Test Recipe");

        // Setup test planner week
        testPlannerWeek = PlannerWeek.builder()
                .id(UUID.randomUUID())
                .startDate(LocalDate.now().with(java.time.DayOfWeek.MONDAY))
                .user(testUser)
                .items(new ArrayList<>())
                .build();

        // Setup test planner item
        testPlannerItem = PlannerItem.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.now())
                .slot(MealSlot.lunch)
                .recipe(testRecipe)
                .portions(2)
                .addedByUser(testUser)
                .plannerWeek(testPlannerWeek)
                .build();

        // Mock security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
        SecurityContextHolder.setContext(securityContext);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("Should get planner weeks for user")
    void shouldGetPlannerWeeksForUser() {
        // Given
        List<PlannerWeek> weeks = Collections.singletonList(testPlannerWeek);
        when(plannerWeekRepository.findByUserOrHouseholdsAndDateRange(
                eq(testUser.getId()), any(), any(), any()
        )).thenReturn(weeks);

        PlannerWeekDto dto = new PlannerWeekDto();
        when(plannerMapper.toDto(testPlannerWeek)).thenReturn(dto);

        // When
        PlannerWeekPageResponse response = plannerService.getPlannersWeeks(null, null, null, null);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getData()).hasSize(1);
        verify(plannerWeekRepository).findByUserOrHouseholdsAndDateRange(
                eq(testUser.getId()), any(), any(), any()
        );
    }

    @Test
    @DisplayName("Should get planner week by id")
    void shouldGetPlannerWeekById() {
        // Given
        UUID weekId = testPlannerWeek.getId();
        when(plannerWeekRepository.findById(weekId)).thenReturn(Optional.of(testPlannerWeek));

        PlannerWeekDto dto = new PlannerWeekDto();
        when(plannerMapper.toDto(testPlannerWeek)).thenReturn(dto);

        // When
        PlannerWeekDto result = plannerService.getPlannerWeekById(weekId);

        // Then
        assertThat(result).isNotNull();
        verify(plannerWeekRepository).findById(weekId);
    }

    @Test
    @DisplayName("Should throw exception when planner week not found")
    void shouldThrowExceptionWhenPlannerWeekNotFound() {
        // Given
        UUID weekId = UUID.randomUUID();
        when(plannerWeekRepository.findById(weekId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> plannerService.getPlannerWeekById(weekId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Planner week not found");
    }

    @Test
    @DisplayName("Should throw exception when user doesn't have access")
    void shouldThrowExceptionWhenUserDoesntHaveAccess() {
        // Given
        User anotherUser = new User();
        anotherUser.setId(UUID.randomUUID());
        testPlannerWeek.setUser(anotherUser);

        UUID weekId = testPlannerWeek.getId();
        when(plannerWeekRepository.findById(weekId)).thenReturn(Optional.of(testPlannerWeek));

        // When & Then
        assertThatThrownBy(() -> plannerService.getPlannerWeekById(weekId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("don't have access");
    }

    @Test
    @DisplayName("Should create personal planner week")
    void shouldCreatePersonalPlannerWeek() {
        // Given
        LocalDate monday = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        CreatePlannerWeekRequest request = new CreatePlannerWeekRequest();
        request.setStartDate(monday);

        when(plannerWeekRepository.save(any(PlannerWeek.class))).thenReturn(testPlannerWeek);

        PlannerWeekDto dto = new PlannerWeekDto();
        when(plannerMapper.toDto(any(PlannerWeek.class))).thenReturn(dto);

        // When
        PlannerWeekDto result = plannerService.createPlannerWeek(request);

        // Then
        assertThat(result).isNotNull();
        verify(plannerWeekRepository).save(any(PlannerWeek.class));
    }

    @Test
    @DisplayName("Should throw exception when start date is not Monday")
    void shouldThrowExceptionWhenStartDateIsNotMonday() {
        // Given
        LocalDate tuesday = LocalDate.now().with(java.time.DayOfWeek.TUESDAY);
        CreatePlannerWeekRequest request = new CreatePlannerWeekRequest();
        request.setStartDate(tuesday);

        // When & Then
        assertThatThrownBy(() -> plannerService.createPlannerWeek(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must be a Monday");
    }

    @Test
    @DisplayName("Should create planner week with items")
    void shouldCreatePlannerWeekWithItems() {
        // Given
        LocalDate monday = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        CreatePlannerItemRequest itemRequest = new CreatePlannerItemRequest();
        itemRequest.setDate(monday);
        itemRequest.setSlot(MealSlot.breakfast);
        itemRequest.setRecipeId(testRecipe.getId());
        itemRequest.setPortions(2);

        CreatePlannerWeekRequest request = new CreatePlannerWeekRequest();
        request.setStartDate(monday);
        request.setItems(Collections.singletonList(itemRequest));

        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));
        when(plannerWeekRepository.save(any(PlannerWeek.class))).thenReturn(testPlannerWeek);

        PlannerWeekDto dto = new PlannerWeekDto();
        when(plannerMapper.toDto(any(PlannerWeek.class))).thenReturn(dto);

        // When
        PlannerWeekDto result = plannerService.createPlannerWeek(request);

        // Then
        assertThat(result).isNotNull();
        verify(recipeRepository).findById(testRecipe.getId());
        verify(plannerWeekRepository).save(any(PlannerWeek.class));
    }

    @Test
    @DisplayName("Should update planner week")
    void shouldUpdatePlannerWeek() {
        // Given
        UUID weekId = testPlannerWeek.getId();
        UpdatePlannerWeekRequest request = new UpdatePlannerWeekRequest();
        request.setItems(Collections.emptyList());

        when(plannerWeekRepository.findById(weekId)).thenReturn(Optional.of(testPlannerWeek));
        when(plannerWeekRepository.save(any(PlannerWeek.class))).thenReturn(testPlannerWeek);

        PlannerWeekDto dto = new PlannerWeekDto();
        when(plannerMapper.toDto(any(PlannerWeek.class))).thenReturn(dto);

        // When
        PlannerWeekDto result = plannerService.updatePlannerWeek(weekId, request);

        // Then
        assertThat(result).isNotNull();
        verify(plannerWeekRepository).save(any(PlannerWeek.class));
    }

    @Test
    @DisplayName("Should delete planner week")
    void shouldDeletePlannerWeek() {
        // Given
        UUID weekId = testPlannerWeek.getId();
        when(plannerWeekRepository.findById(weekId)).thenReturn(Optional.of(testPlannerWeek));

        // When
        plannerService.deletePlannerWeek(weekId);

        // Then
        verify(plannerWeekRepository).delete(testPlannerWeek);
    }

    @Test
    @DisplayName("Should create household planner week")
    void shouldCreateHouseholdPlannerWeek() {
        // Given
        testUser.setHousehold(testHousehold);
        LocalDate monday = LocalDate.now().with(java.time.DayOfWeek.MONDAY);

        CreatePlannerWeekRequest request = new CreatePlannerWeekRequest();
        request.setStartDate(monday);
        request.setHouseholdId(testHousehold.getId());

        PlannerWeek householdWeek = PlannerWeek.builder()
                .id(UUID.randomUUID())
                .startDate(monday)
                .household(testHousehold)
                .items(new ArrayList<>())
                .build();

        when(plannerWeekRepository.save(any(PlannerWeek.class))).thenReturn(householdWeek);

        PlannerWeekDto dto = new PlannerWeekDto();
        when(plannerMapper.toDto(any(PlannerWeek.class))).thenReturn(dto);

        // When
        PlannerWeekDto result = plannerService.createPlannerWeek(request);

        // Then
        assertThat(result).isNotNull();
        verify(plannerWeekRepository).save(any(PlannerWeek.class));
    }

    @Test
    @DisplayName("Should throw exception when creating household planner without access")
    void shouldThrowExceptionWhenCreatingHouseholdPlannerWithoutAccess() {
        // Given
        LocalDate monday = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        CreatePlannerWeekRequest request = new CreatePlannerWeekRequest();
        request.setStartDate(monday);
        request.setHouseholdId(UUID.randomUUID()); // Different household

        // When & Then
        assertThatThrownBy(() -> plannerService.createPlannerWeek(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("don't have access");
    }
}
