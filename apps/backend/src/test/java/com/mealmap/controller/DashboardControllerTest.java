package com.mealmap.controller;

import com.mealmap.model.dto.dashboard.DashboardStatsDto;
import com.mealmap.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("DashboardController Tests")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    private DashboardStatsDto mockStats;

    @BeforeEach
    void setUp() {
        mockStats = DashboardStatsDto.builder()
                .ingredientsCount(25L)
                .recipesCount(15L)
                .plannedMealsCount(8L)
                .pantryItemsCount(40L)
                .upcomingMealsCount(12L)
                .build();
    }

    @Test
    @DisplayName("GET /dashboard/stats - Should return dashboard statistics")
    void shouldReturnDashboardStatistics() throws Exception {
        // Given
        when(dashboardService.getDashboardStats()).thenReturn(mockStats);

        // When & Then
        mockMvc.perform(get("/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ingredientsCount").value(25))
                .andExpect(jsonPath("$.recipesCount").value(15))
                .andExpect(jsonPath("$.plannedMealsCount").value(8))
                .andExpect(jsonPath("$.pantryItemsCount").value(40))
                .andExpect(jsonPath("$.upcomingMealsCount").value(12));
    }

    @Test
    @DisplayName("GET /dashboard/stats - Should handle zero counts")
    void shouldHandleZeroCounts() throws Exception {
        // Given
        DashboardStatsDto emptyStats = DashboardStatsDto.builder()
                .ingredientsCount(0L)
                .recipesCount(0L)
                .plannedMealsCount(0L)
                .pantryItemsCount(0L)
                .upcomingMealsCount(0L)
                .build();

        when(dashboardService.getDashboardStats()).thenReturn(emptyStats);

        // When & Then
        mockMvc.perform(get("/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ingredientsCount").value(0))
                .andExpect(jsonPath("$.recipesCount").value(0))
                .andExpect(jsonPath("$.plannedMealsCount").value(0))
                .andExpect(jsonPath("$.pantryItemsCount").value(0))
                .andExpect(jsonPath("$.upcomingMealsCount").value(0));
    }

    @Test
    @DisplayName("GET /dashboard/stats - Should handle large counts")
    void shouldHandleLargeCounts() throws Exception {
        // Given
        DashboardStatsDto largeStats = DashboardStatsDto.builder()
                .ingredientsCount(10000L)
                .recipesCount(5000L)
                .plannedMealsCount(100L)
                .pantryItemsCount(50000L)
                .upcomingMealsCount(200L)
                .build();

        when(dashboardService.getDashboardStats()).thenReturn(largeStats);

        // When & Then
        mockMvc.perform(get("/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ingredientsCount").value(10000))
                .andExpect(jsonPath("$.recipesCount").value(5000))
                .andExpect(jsonPath("$.plannedMealsCount").value(100))
                .andExpect(jsonPath("$.pantryItemsCount").value(50000))
                .andExpect(jsonPath("$.upcomingMealsCount").value(200));
    }

    @Test
    @DisplayName("GET /dashboard/stats - Should handle service exceptions")
    void shouldHandleServiceExceptions() throws Exception {
        // Given
        when(dashboardService.getDashboardStats())
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/dashboard/stats"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @DisplayName("GET /dashboard/stats - Should return correct content type")
    void shouldReturnCorrectContentType() throws Exception {
        // Given
        when(dashboardService.getDashboardStats()).thenReturn(mockStats);

        // When & Then
        mockMvc.perform(get("/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /dashboard/stats - Should not require request body")
    void shouldNotRequireRequestBody() throws Exception {
        // Given
        when(dashboardService.getDashboardStats()).thenReturn(mockStats);

        // When & Then
        mockMvc.perform(get("/dashboard/stats"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /dashboard/stats - Should handle GET method only")
    void shouldHandleGetMethodOnly() throws Exception {
        // When & Then - POST should not be allowed
        mockMvc.perform(post("/dashboard/stats"))
                .andExpect(status().isMethodNotAllowed());
    }
}
