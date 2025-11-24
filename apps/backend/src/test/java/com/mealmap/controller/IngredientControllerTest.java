package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.model.dto.ingredient.*;
import com.mealmap.model.embedded.PackageSize;
import com.mealmap.model.entity.User;
import com.mealmap.model.enums.Unit;
import com.mealmap.service.IngredientService;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = IngredientController.class,
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
@DisplayName("IngredientController Integration Tests")
public class IngredientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IngredientService ingredientService;

    @MockBean
    private com.mealmap.repository.UserRepository userRepository;

    private IngredientDto ingredientDto;
    private CreateIngredientRequest createRequest;
    private UpdateIngredientRequest updateRequest;
    private IngredientPageResponse pageResponse;

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
                .data(Collections.singletonList(ingredientDto))
                .nextCursor(null)
                .build();
    }

    @Test
    @WithMockUser
    @DisplayName("Should return list of ingredients when get ingredients is called")
    void shouldReturnListOfIngredients_WhenGetIngredientsIsCalled() throws Exception {
        // Arrange
        when(ingredientService.getIngredients(any(), any(), any(), any())).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/ingredients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Milk"));
    }

    @Test
    @WithMockUser
    @DisplayName("Should return filtered ingredients when search query is provided")
    void shouldReturnFilteredIngredients_WhenSearchQueryIsProvided() throws Exception {
        // Arrange
        String query = "milk";
        when(ingredientService.getIngredients(eq(20), any(), eq(query), any())).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/ingredients")
                        .param("q", query)
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Milk"));

        verify(ingredientService).getIngredients(eq(20), any(), eq(query), any());
    }

    @Test
    @WithMockUser
    @DisplayName("Should return ingredient details when valid ID is provided")
    void shouldReturnIngredientDetails_WhenValidIdIsProvided() throws Exception {
        // Arrange
        when(ingredientService.getIngredientById(ingredientDto.getId())).thenReturn(ingredientDto);

        // Act & Assert
        mockMvc.perform(get("/ingredients/{id}", ingredientDto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ingredientDto.getId().toString()))
                .andExpect(jsonPath("$.name").value("Milk"));
    }

    @Test
    @WithMockUser
    @DisplayName("Should create ingredient when valid request is provided")
    void shouldCreateIngredient_WhenValidRequestIsProvided() throws Exception {
        // Arrange
        when(ingredientService.createIngredient(any(CreateIngredientRequest.class))).thenReturn(ingredientDto);

        // Act & Assert
        mockMvc.perform(post("/ingredients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Milk"));
    }

    @Test
    @WithMockUser
    @DisplayName("Should return Bad Request when create request is invalid")
    void shouldReturnBadRequest_WhenCreateRequestIsInvalid() throws Exception {
        // Arrange
        CreateIngredientRequest invalidRequest = new CreateIngredientRequest(); // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/ingredients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest))
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("Should update ingredient when valid request is provided")
    void shouldUpdateIngredient_WhenValidRequestIsProvided() throws Exception {
        // Arrange
        IngredientDto updatedDto = IngredientDto.builder()
                .id(ingredientDto.getId())
                .name("Whole Milk")
                .build();
        when(ingredientService.updateIngredient(eq(ingredientDto.getId()), any(UpdateIngredientRequest.class)))
                .thenReturn(updatedDto);

        // Act & Assert
        mockMvc.perform(patch("/ingredients/{id}", ingredientDto.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Whole Milk"));
    }

    @Test
    @WithMockUser
    @DisplayName("Should delete ingredient when ingredient exists")
    void shouldDeleteIngredient_WhenIngredientExists() throws Exception {
        // Arrange
        doNothing().when(ingredientService).deleteIngredient(ingredientDto.getId());

        // Act & Assert
        mockMvc.perform(delete("/ingredients/{id}", ingredientDto.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(ingredientService).deleteIngredient(ingredientDto.getId());
    }
}
