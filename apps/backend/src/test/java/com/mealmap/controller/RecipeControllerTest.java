package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.model.dto.recipe.*;
import com.mealmap.model.embedded.Quantity;
import com.mealmap.model.enums.Unit;
import com.mealmap.service.RecipeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = RecipeController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
    }
)
@DisplayName("RecipeController Integration Tests")
@SuppressWarnings("null")
class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecipeService recipeService;
    
    @MockBean
    private com.mealmap.security.JwtService jwtService;
    
    @MockBean
    private com.mealmap.service.CustomUserDetailsService userDetailsService;

    private RecipeDto recipeDto;
    private CreateRecipeRequest createRequest;
    private UpdateRecipeRequest updateRequest;
    private RecipePageResponse pageResponse;

    @BeforeEach
    void setUp() {
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
                .items(Arrays.asList(itemDto))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        createRequest = new CreateRecipeRequest();
        createRequest.setName("Grilled Chicken");
        createRequest.setExternalUrl("https://example.com/recipe");
        createRequest.setItems(Arrays.asList(itemDto));

        updateRequest = new UpdateRecipeRequest();
        updateRequest.setName("BBQ Chicken");

        pageResponse = RecipePageResponse.builder()
                .data(Arrays.asList(recipeDto))
                .nextCursor(null)
                .build();
    }

    @Test
    @DisplayName("Should get recipes successfully")
    void shouldGetRecipesSuccessfully() throws Exception {
        // Given
        when(recipeService.getRecipes(any(), any(), any())).thenReturn(pageResponse);

        // When & Then
        mockMvc.perform(get("/recipes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Grilled Chicken"))
                .andExpect(jsonPath("$.data[0].items.length()").value(1))
                .andExpect(jsonPath("$.nextCursor").isEmpty());
    }

    @Test
    @DisplayName("Should get recipes with search query")
    void shouldGetRecipesWithSearchQuery() throws Exception {
        // Given
        when(recipeService.getRecipes(eq(20), any(), eq("chicken"))).thenReturn(pageResponse);

        // When & Then
        mockMvc.perform(get("/recipes")
                        .param("q", "chicken")
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Grilled Chicken"));

        verify(recipeService).getRecipes(eq(20), any(), eq("chicken"));
    }

    @Test
    @DisplayName("Should get recipe by id")
    void shouldGetRecipeById() throws Exception {
        // Given
        when(recipeService.getRecipeById(recipeDto.getId())).thenReturn(recipeDto);

        // When & Then
        mockMvc.perform(get("/recipes/{id}", recipeDto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(recipeDto.getId().toString()))
                .andExpect(jsonPath("$.name").value("Grilled Chicken"))
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    @DisplayName("Should create recipe successfully")
    void shouldCreateRecipeSuccessfully() throws Exception {
        // Given
        when(recipeService.createRecipe(any(CreateRecipeRequest.class))).thenReturn(recipeDto);

        // When & Then
        mockMvc.perform(post("/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Grilled Chicken"))
                .andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test
    @DisplayName("Should return 400 when create request is invalid")
    void shouldReturn400WhenCreateRequestIsInvalid() throws Exception {
        // Given
        CreateRecipeRequest invalidRequest = new CreateRecipeRequest();
        // Missing required fields

        // When & Then
        mockMvc.perform(post("/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should update recipe successfully")
    void shouldUpdateRecipeSuccessfully() throws Exception {
        // Given
        RecipeDto updatedDto = RecipeDto.builder()
                .id(recipeDto.getId())
                .name("BBQ Chicken")
                .externalUrl(recipeDto.getExternalUrl())
                .items(recipeDto.getItems())
                .createdAt(recipeDto.getCreatedAt())
                .updatedAt(Instant.now())
                .build();

        when(recipeService.updateRecipe(eq(recipeDto.getId()), any(UpdateRecipeRequest.class)))
                .thenReturn(updatedDto);

        // When & Then
        mockMvc.perform(patch("/recipes/{id}", recipeDto.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("BBQ Chicken"));
    }

    @Test
    @DisplayName("Should delete recipe successfully")
    void shouldDeleteRecipeSuccessfully() throws Exception {
        // Given
        doNothing().when(recipeService).deleteRecipe(recipeDto.getId());

        // When & Then
        mockMvc.perform(delete("/recipes/{id}", recipeDto.getId()))
                .andExpect(status().isNoContent());

        verify(recipeService).deleteRecipe(recipeDto.getId());
    }

    @Test
    @DisplayName("Should validate max items limit")
    void shouldValidateMaxItemsLimit() throws Exception {
        // Given - Create request with 151 items (exceeds max of 150)
        CreateRecipeRequest tooManyItems = new CreateRecipeRequest();
        tooManyItems.setName("Too Many Items Recipe");
        
        // Create 151 items
        RecipeItemDto[] items = new RecipeItemDto[151];
        for (int i = 0; i < 151; i++) {
            RecipeItemDto item = new RecipeItemDto();
            item.setIngredientId(UUID.randomUUID());
            item.setQuantity(Quantity.builder()
                    .amount(new BigDecimal("1.0"))
                    .unit(Unit.kg)
                    .build());
            items[i] = item;
        }
        tooManyItems.setItems(Arrays.asList(items));

        // When & Then
        mockMvc.perform(post("/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tooManyItems)))
                .andExpect(status().isBadRequest());
    }
}
