package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mealmap.model.dto.planner.*;
import com.mealmap.model.entity.User;
import com.mealmap.model.enums.MealSlot;
import com.mealmap.service.PlannerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = PlannerController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
    },
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {
            com.mealmap.security.JwtAuthenticationFilter.class,
            com.mealmap.config.SecurityConfig.class
        }
    )
)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("PlannerController Integration Tests")
public class PlannerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlannerService plannerService;

    @MockBean
    private com.mealmap.repository.UserRepository userRepository;

    private ObjectMapper objectMapper;
    private PlannerWeekDto plannerWeekDto;
    private CreatePlannerWeekRequest createRequest;
    private UpdatePlannerWeekRequest updateRequest;

    @BeforeEach
    void setUp() {
        // Arrange: Setup common test data
        User mockUser = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .displayName("Test User")
                .passwordHash("hash")
                .build();
        when(userRepository.findByEmail(anyString())).thenReturn(java.util.Optional.of(mockUser));

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalDate monday = LocalDate.now().with(java.time.DayOfWeek.MONDAY);

        PlannerItemDto itemDto = PlannerItemDto.builder()
                .id(UUID.randomUUID())
                .date(monday)
                .slot(MealSlot.breakfast)
                .recipeId(UUID.randomUUID())
                .recipeName("Test Recipe")
                .portions(2)
                .addedByUserId(UUID.randomUUID())
                .build();

        plannerWeekDto = PlannerWeekDto.builder()
                .id(UUID.randomUUID())
                .startDate(monday)
                .userId(UUID.randomUUID())
                .items(Collections.singletonList(itemDto))
                .build();

        CreatePlannerItemRequest createItemRequest = new CreatePlannerItemRequest();
        createItemRequest.setDate(monday);
        createItemRequest.setSlot(MealSlot.breakfast);
        createItemRequest.setRecipeId(UUID.randomUUID());
        createItemRequest.setPortions(2);

        createRequest = new CreatePlannerWeekRequest();
        createRequest.setStartDate(monday);
        createRequest.setItems(Collections.singletonList(createItemRequest));

        updateRequest = new UpdatePlannerWeekRequest();
        updateRequest.setItems(Collections.emptyList());
    }

    @Test
    @WithMockUser
    @DisplayName("Should return list of planner weeks when get planner weeks is called")
    void shouldReturnListOfPlannerWeeks_WhenGetPlannerWeeksIsCalled() throws Exception {
        // Arrange
        PlannerWeekPageResponse response = PlannerWeekPageResponse.builder()
                .data(Collections.singletonList(plannerWeekDto))
                .nextCursor(null)
                .build();
        when(plannerService.getPlannersWeeks(any(), any(), any(), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/planner/weeks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("Should return planner week details when valid ID is provided")
    void shouldReturnPlannerWeekDetails_WhenValidIdIsProvided() throws Exception {
        // Arrange
        UUID weekId = plannerWeekDto.getId();
        when(plannerService.getPlannerWeekById(weekId)).thenReturn(plannerWeekDto);

        // Act & Assert
        mockMvc.perform(get("/planner/weeks/{id}", weekId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(weekId.toString()));
    }

    @Test
    @WithMockUser
    @DisplayName("Should create planner week when valid request is provided")
    void shouldCreatePlannerWeek_WhenValidRequestIsProvided() throws Exception {
        // Arrange
        when(plannerService.createPlannerWeek(any(CreatePlannerWeekRequest.class)))
                .thenReturn(plannerWeekDto);

        // Act & Assert
        mockMvc.perform(post("/planner/weeks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("Should return Bad Request when create request is invalid")
    void shouldReturnBadRequest_WhenCreateRequestIsInvalid() throws Exception {
        // Arrange
        CreatePlannerWeekRequest invalidRequest = new CreatePlannerWeekRequest(); // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/planner/weeks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest))
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("Should update planner week when valid request is provided")
    void shouldUpdatePlannerWeek_WhenValidRequestIsProvided() throws Exception {
        // Arrange
        UUID weekId = plannerWeekDto.getId();
        when(plannerService.updatePlannerWeek(eq(weekId), any(UpdatePlannerWeekRequest.class)))
                .thenReturn(plannerWeekDto);

        // Act & Assert
        mockMvc.perform(patch("/planner/weeks/{id}", weekId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(weekId.toString()));
    }

    @Test
    @WithMockUser
    @DisplayName("Should delete planner week when week exists")
    void shouldDeletePlannerWeek_WhenWeekExists() throws Exception {
        // Arrange
        UUID weekId = plannerWeekDto.getId();
        doNothing().when(plannerService).deletePlannerWeek(weekId);

        // Act & Assert
        mockMvc.perform(delete("/planner/weeks/{id}", weekId)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(plannerService).deletePlannerWeek(weekId);
    }

    @Test
    @WithMockUser
    @DisplayName("Should filter planner weeks by date range")
    void shouldFilterPlannerWeeks_WhenDateRangeIsProvided() throws Exception {
        // Arrange
        LocalDate from = LocalDate.now().minusWeeks(1);
        LocalDate to = LocalDate.now().plusWeeks(1);
        PlannerWeekPageResponse response = PlannerWeekPageResponse.builder()
                .data(Collections.singletonList(plannerWeekDto))
                .nextCursor(null)
                .build();
        when(plannerService.getPlannersWeeks(any(), any(), any(), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/planner/weeks")
                        .param("from", from.toString())
                        .param("to", to.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        verify(plannerService).getPlannersWeeks(any(), any(), any(), any());
    }
}
