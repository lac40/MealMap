package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mealmap.model.dto.planner.*;
import com.mealmap.model.enums.MealSlot;
import com.mealmap.service.PlannerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = PlannerController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
    }
)
@DisplayName("PlannerController Integration Tests")
class PlannerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlannerService plannerService;
    
    @MockBean
    private com.mealmap.security.JwtService jwtService;
    
    @MockBean
    private com.mealmap.service.CustomUserDetailsService userDetailsService;

    private ObjectMapper objectMapper;
    private PlannerWeekDto plannerWeekDto;
    private CreatePlannerWeekRequest createRequest;
    private UpdatePlannerWeekRequest updateRequest;

    @BeforeEach
    void setUp() {
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
    @DisplayName("Should get planner weeks successfully")
    void shouldGetPlannerWeeksSuccessfully() throws Exception {
        // Given
        PlannerWeekPageResponse response = PlannerWeekPageResponse.builder()
                .data(Collections.singletonList(plannerWeekDto))
                .nextCursor(null)
                .build();

        when(plannerService.getPlannersWeeks(any(), any(), any(), any())).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/planner/weeks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").exists());

        verify(plannerService).getPlannersWeeks(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should get planner week by id")
    void shouldGetPlannerWeekById() throws Exception {
        // Given
        UUID weekId = plannerWeekDto.getId();
        when(plannerService.getPlannerWeekById(weekId)).thenReturn(plannerWeekDto);

        // When & Then
        mockMvc.perform(get("/planner/weeks/{id}", weekId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(weekId.toString()))
                .andExpect(jsonPath("$.items").isArray());

        verify(plannerService).getPlannerWeekById(weekId);
    }

    @Test
    @DisplayName("Should create planner week successfully")
    void shouldCreatePlannerWeekSuccessfully() throws Exception {
        // Given
        when(plannerService.createPlannerWeek(any(CreatePlannerWeekRequest.class)))
                .thenReturn(plannerWeekDto);

        // When & Then
        mockMvc.perform(post("/planner/weeks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.items").isArray());

        verify(plannerService).createPlannerWeek(any(CreatePlannerWeekRequest.class));
    }

    @Test
    @DisplayName("Should return 400 when create request is invalid")
    void shouldReturn400WhenCreateRequestIsInvalid() throws Exception {
        // Given
        CreatePlannerWeekRequest invalidRequest = new CreatePlannerWeekRequest();
        // Missing required fields

        // When & Then
        mockMvc.perform(post("/planner/weeks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should update planner week successfully")
    void shouldUpdatePlannerWeekSuccessfully() throws Exception {
        // Given
        UUID weekId = plannerWeekDto.getId();
        when(plannerService.updatePlannerWeek(eq(weekId), any(UpdatePlannerWeekRequest.class)))
                .thenReturn(plannerWeekDto);

        // When & Then
        mockMvc.perform(patch("/planner/weeks/{id}", weekId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(weekId.toString()));

        verify(plannerService).updatePlannerWeek(eq(weekId), any(UpdatePlannerWeekRequest.class));
    }

    @Test
    @DisplayName("Should delete planner week successfully")
    void shouldDeletePlannerWeekSuccessfully() throws Exception {
        // Given
        UUID weekId = plannerWeekDto.getId();
        doNothing().when(plannerService).deletePlannerWeek(weekId);

        // When & Then
        mockMvc.perform(delete("/planner/weeks/{id}", weekId))
                .andExpect(status().isNoContent());

        verify(plannerService).deletePlannerWeek(weekId);
    }

    @Test
    @DisplayName("Should filter planner weeks by date range")
    void shouldFilterPlannerWeeksByDateRange() throws Exception {
        // Given
        LocalDate from = LocalDate.now().minusWeeks(1);
        LocalDate to = LocalDate.now().plusWeeks(1);

        PlannerWeekPageResponse response = PlannerWeekPageResponse.builder()
                .data(Collections.singletonList(plannerWeekDto))
                .nextCursor(null)
                .build();

        when(plannerService.getPlannersWeeks(any(), any(), any(), any())).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/planner/weeks")
                        .param("from", from.toString())
                        .param("to", to.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        verify(plannerService).getPlannersWeeks(any(), any(), any(), any());
    }
}
