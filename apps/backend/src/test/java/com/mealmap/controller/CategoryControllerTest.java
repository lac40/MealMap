package com.mealmap.controller;

import com.mealmap.model.dto.CategoryDto;
import com.mealmap.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = CategoryController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
    }
)
@DisplayName("CategoryController Integration Tests")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    private List<CategoryDto> categories;

    @BeforeEach
    void setUp() {
        categories = Arrays.asList(
                CategoryDto.builder()
                        .id(UUID.randomUUID())
                        .name("Dairy & Eggs")
                        .sortOrder(1)
                        .build(),
                CategoryDto.builder()
                        .id(UUID.randomUUID())
                        .name("Meat & Fish")
                        .sortOrder(2)
                        .build(),
                CategoryDto.builder()
                        .id(UUID.randomUUID())
                        .name("Fruits & Vegetables")
                        .sortOrder(3)
                        .build()
        );
    }

    @Test
    @DisplayName("Should get all categories successfully")
    void shouldGetAllCategoriesSuccessfully() throws Exception {
        // Given
        when(categoryService.getAllCategories()).thenReturn(categories);

        // When & Then
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].name").value("Dairy & Eggs"))
                .andExpect(jsonPath("$[0].sortOrder").value(1))
                .andExpect(jsonPath("$[1].name").value("Meat & Fish"))
                .andExpect(jsonPath("$[2].name").value("Fruits & Vegetables"));
    }

    @Test
    @DisplayName("Should return empty array when no categories exist")
    void shouldReturnEmptyArrayWhenNoCategoriesExist() throws Exception {
        // Given
        when(categoryService.getAllCategories()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
