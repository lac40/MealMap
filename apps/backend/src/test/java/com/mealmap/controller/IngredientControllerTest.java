package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.model.dto.ingredient.*;
import com.mealmap.model.embedded.PackageSize;
import com.mealmap.model.enums.Unit;
import com.mealmap.service.IngredientService;
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
    controllers = IngredientController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
    }
)
@DisplayName("IngredientController Integration Tests")
class IngredientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IngredientService ingredientService;

    private IngredientDto ingredientDto;
    private CreateIngredientRequest createRequest;
    private UpdateIngredientRequest updateRequest;
    private IngredientPageResponse pageResponse;

    @BeforeEach
    void setUp() {
        UUID categoryId = UUID.randomUUID();
        
        ingredientDto = IngredientDto.builder()
                .id(UUID.randomUUID())
                .ownerUserId(UUID.randomUUID())
                .name("Milk")
                .categoryId(categoryId)
                .defaultUnit(Unit.l)
                .packageSize(PackageSize.builder()
                        .amount(BigDecimal.ONE)
                        .unit(Unit.l)
                        .build())
                .notes("Fresh milk")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        createRequest = new CreateIngredientRequest();
        createRequest.setName("Milk");
        createRequest.setCategoryId(categoryId);
        createRequest.setDefaultUnit(Unit.l);
        createRequest.setPackageSize(PackageSize.builder()
                .amount(BigDecimal.ONE)
                .unit(Unit.l)
                .build());
        createRequest.setNotes("Fresh milk");

        updateRequest = new UpdateIngredientRequest();
        updateRequest.setName("Whole Milk");

        pageResponse = IngredientPageResponse.builder()
                .data(Arrays.asList(ingredientDto))
                .nextCursor(null)
                .build();
    }

    @Test
    @DisplayName("Should get ingredients successfully")
    void shouldGetIngredientsSuccessfully() throws Exception {
        // Given
        when(ingredientService.getIngredients(any(), any(), any(), any())).thenReturn(pageResponse);

        // When & Then
        mockMvc.perform(get("/ingredients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Milk"))
                .andExpect(jsonPath("$.nextCursor").isEmpty());
    }

    @Test
    @DisplayName("Should get ingredients with search query")
    void shouldGetIngredientsWithSearchQuery() throws Exception {
        // Given
        when(ingredientService.getIngredients(eq(20), any(), eq("milk"), any())).thenReturn(pageResponse);

        // When & Then
        mockMvc.perform(get("/ingredients")
                        .param("q", "milk")
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Milk"));

        verify(ingredientService).getIngredients(eq(20), any(), eq("milk"), any());
    }

    @Test
    @DisplayName("Should get ingredient by id")
    void shouldGetIngredientById() throws Exception {
        // Given
        when(ingredientService.getIngredientById(ingredientDto.getId())).thenReturn(ingredientDto);

        // When & Then
        mockMvc.perform(get("/ingredients/{id}", ingredientDto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ingredientDto.getId().toString()))
                .andExpect(jsonPath("$.name").value("Milk"));
    }

    @Test
    @DisplayName("Should create ingredient successfully")
    void shouldCreateIngredientSuccessfully() throws Exception {
        // Given
        when(ingredientService.createIngredient(any(CreateIngredientRequest.class))).thenReturn(ingredientDto);

        // When & Then
        mockMvc.perform(post("/ingredients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Milk"))
                .andExpect(jsonPath("$.defaultUnit").value("l"));
    }

    @Test
    @DisplayName("Should return 400 when create request is invalid")
    void shouldReturn400WhenCreateRequestIsInvalid() throws Exception {
        // Given
        CreateIngredientRequest invalidRequest = new CreateIngredientRequest();
        // Missing required fields

        // When & Then
        mockMvc.perform(post("/ingredients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should update ingredient successfully")
    void shouldUpdateIngredientSuccessfully() throws Exception {
        // Given
        IngredientDto updatedDto = IngredientDto.builder()
                .id(ingredientDto.getId())
                .ownerUserId(ingredientDto.getOwnerUserId())
                .name("Whole Milk")
                .categoryId(ingredientDto.getCategoryId())
                .defaultUnit(ingredientDto.getDefaultUnit())
                .packageSize(ingredientDto.getPackageSize())
                .createdAt(ingredientDto.getCreatedAt())
                .updatedAt(Instant.now())
                .build();

        when(ingredientService.updateIngredient(eq(ingredientDto.getId()), any(UpdateIngredientRequest.class)))
                .thenReturn(updatedDto);

        // When & Then
        mockMvc.perform(patch("/ingredients/{id}", ingredientDto.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Whole Milk"));
    }

    @Test
    @DisplayName("Should delete ingredient successfully")
    void shouldDeleteIngredientSuccessfully() throws Exception {
        // Given
        doNothing().when(ingredientService).deleteIngredient(ingredientDto.getId());

        // When & Then
        mockMvc.perform(delete("/ingredients/{id}", ingredientDto.getId()))
                .andExpect(status().isNoContent());

        verify(ingredientService).deleteIngredient(ingredientDto.getId());
    }
}
