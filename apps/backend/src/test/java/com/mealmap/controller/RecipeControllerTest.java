package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.model.dto.recipe.*;
import com.mealmap.model.embedded.Quantity;
import com.mealmap.model.entity.User;
import com.mealmap.model.enums.Unit;
import com.mealmap.service.RecipeService;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = RecipeController.class,
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
@DisplayName("RecipeController Integration Tests")
public class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecipeService recipeService;

    @MockBean
    private com.mealmap.repository.UserRepository userRepository;

    private RecipeDto recipeDto;
    private CreateRecipeRequest createRequest;
    private UpdateRecipeRequest updateRequest;
    private RecipePageResponse pageResponse;

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

        RecipeItemDto itemDto = new RecipeItemDto();
        itemDto.setIngredientId(UUID.randomUUID());
        itemDto.setQuantity(Quantity.builder()
                .amount(new BigDecimal("0.5"))
                .unit(Unit.kg)
                .build());
        itemDto.setPackageNote("Fresh");

        recipeDto = RecipeDto.builder()
                .id(UUID.randomUUID())
                .name("Grilled Chicken")
                .externalUrl("https://example.com/recipe")
                .items(Collections.singletonList(itemDto))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        createRequest = new CreateRecipeRequest();
        createRequest.setName("Grilled Chicken");
        createRequest.setExternalUrl("https://example.com/recipe");
        createRequest.setItems(Collections.singletonList(itemDto));

        updateRequest = new UpdateRecipeRequest();
        updateRequest.setName("BBQ Chicken");

        pageResponse = RecipePageResponse.builder()
                .data(Collections.singletonList(recipeDto))
                .nextCursor(null)
                .build();
    }

    @Test
    @DisplayName("Should return list of recipes when get recipes is called")
    void shouldReturnListOfRecipes_WhenGetRecipesIsCalled() throws Exception {
        // Arrange
        when(recipeService.getRecipes(any(), any(), any())).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/recipes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Grilled Chicken"));
    }

    @Test
    @DisplayName("Should return filtered recipes when search query is provided")
    void shouldReturnFilteredRecipes_WhenSearchQueryIsProvided() throws Exception {
        // Arrange
        String query = "chicken";
        when(recipeService.getRecipes(eq(20), any(), eq(query))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/recipes")
                        .param("q", query)
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Grilled Chicken"));

        verify(recipeService).getRecipes(eq(20), any(), eq(query));
    }

    @Test
    @DisplayName("Should return recipe details when valid ID is provided")
    void shouldReturnRecipeDetails_WhenValidIdIsProvided() throws Exception {
        // Arrange
        when(recipeService.getRecipeById(recipeDto.getId())).thenReturn(recipeDto);

        // Act & Assert
        mockMvc.perform(get("/recipes/{id}", recipeDto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(recipeDto.getId().toString()))
                .andExpect(jsonPath("$.name").value("Grilled Chicken"));
    }

    @Test
    @DisplayName("Should create recipe when valid request is provided")
    void shouldCreateRecipe_WhenValidRequestIsProvided() throws Exception {
        // Arrange
        when(recipeService.createRecipe(any(CreateRecipeRequest.class))).thenReturn(recipeDto);

        // Act & Assert
        mockMvc.perform(post("/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Grilled Chicken"));
    }

    @Test
    @DisplayName("Should return Bad Request when create request is invalid")
    void shouldReturnBadRequest_WhenCreateRequestIsInvalid() throws Exception {
        // Arrange
        CreateRecipeRequest invalidRequest = new CreateRecipeRequest(); // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should update recipe when valid request is provided")
    void shouldUpdateRecipe_WhenValidRequestIsProvided() throws Exception {
        // Arrange
        RecipeDto updatedDto = RecipeDto.builder()
                .id(recipeDto.getId())
                .name("BBQ Chicken")
                .build();
        when(recipeService.updateRecipe(eq(recipeDto.getId()), any(UpdateRecipeRequest.class)))
                .thenReturn(updatedDto);

        // Act & Assert
        mockMvc.perform(patch("/recipes/{id}", recipeDto.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("BBQ Chicken"));
    }

    @Test
    @DisplayName("Should delete recipe when recipe exists")
    void shouldDeleteRecipe_WhenRecipeExists() throws Exception {
        // Arrange
        doNothing().when(recipeService).deleteRecipe(recipeDto.getId());

        // Act & Assert
        mockMvc.perform(delete("/recipes/{id}", recipeDto.getId()))
                .andExpect(status().isNoContent());

        verify(recipeService).deleteRecipe(recipeDto.getId());
    }
}
