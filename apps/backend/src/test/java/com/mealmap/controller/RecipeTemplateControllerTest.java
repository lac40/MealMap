package com.mealmap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.model.dto.recipe.CreateRecipeTemplateRequest;
import com.mealmap.model.dto.recipe.RecipeDto;
import com.mealmap.model.dto.recipe.RecipeItemDto;
import com.mealmap.model.dto.recipe.RecipeTemplateDto;
import com.mealmap.model.dto.recipe.RecipeTemplateDuplicateRequest;
import com.mealmap.model.dto.recipe.RecipeTemplatePageResponse;
import com.mealmap.model.dto.recipe.RecipeTemplatePreferencesRequest;
import com.mealmap.model.dto.recipe.UpdateRecipeTemplateRequest;
import com.mealmap.model.embedded.Quantity;
import com.mealmap.model.enums.RecipeTemplateSource;
import com.mealmap.model.enums.Unit;
import com.mealmap.service.RecipeTemplateService;
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
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = RecipeTemplateController.class,
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
@DisplayName("RecipeTemplateController web layer")
class RecipeTemplateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecipeTemplateService templateService;

    @MockBean
    private com.mealmap.repository.UserRepository userRepository;

    private RecipeTemplateDto templateDto;
    private RecipeTemplatePageResponse pageResponse;
    private CreateRecipeTemplateRequest createRequest;
    private UpdateRecipeTemplateRequest updateRequest;
    private RecipeDto duplicatedRecipe;

    @BeforeEach
    void setUp() {
        RecipeItemDto itemDto = RecipeItemDto.builder()
                .ingredientId(UUID.randomUUID())
                .quantity(Quantity.builder()
                        .amount(new BigDecimal("1.0"))
                        .unit(Unit.kg)
                        .build())
                .packageNote("note")
                .build();

        templateDto = RecipeTemplateDto.builder()
                .id(UUID.randomUUID())
                .name("Template")
                .description("desc")
                .tags(Collections.singletonList("tag"))
                .dietaryTags(Collections.singletonList("veg"))
                .source(RecipeTemplateSource.user)
                .favorite(false)
                .hidden(false)
                .immutable(false)
                .items(Collections.singletonList(itemDto))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        pageResponse = RecipeTemplatePageResponse.builder()
                .data(Collections.singletonList(templateDto))
                .nextCursor(null)
                .build();

        createRequest = CreateRecipeTemplateRequest.builder()
                .name("Template")
                .description("desc")
                .tags(Collections.singletonList("tag"))
                .dietaryTags(Collections.singletonList("veg"))
                .items(Collections.singletonList(itemDto))
                .build();

        updateRequest = UpdateRecipeTemplateRequest.builder()
                .name("Updated")
                .build();

        duplicatedRecipe = RecipeDto.builder()
                .id(UUID.randomUUID())
                .name("Duped")
                .externalUrl("https://example.com")
                .items(Collections.singletonList(itemDto))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("GET /templates returns paged templates")
    @WithMockUser
    void getTemplates_returnsPage() throws Exception {
        when(templateService.getTemplates(any(), any(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Template"));
    }

    @Test
    @DisplayName("POST /templates creates template")
    @WithMockUser
    void createTemplate_returnsCreated() throws Exception {
        when(templateService.createTemplate(any())).thenReturn(templateDto);

        mockMvc.perform(post("/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Template"));
    }

    @Test
    @DisplayName("PATCH /templates/{id} updates template")
    @WithMockUser
    void updateTemplate_returnsUpdated() throws Exception {
        RecipeTemplateDto updated = RecipeTemplateDto.builder()
                .id(templateDto.getId())
                .name("Updated")
                .description(templateDto.getDescription())
                .tags(templateDto.getTags())
                .dietaryTags(templateDto.getDietaryTags())
                .source(templateDto.getSource())
                .favorite(templateDto.isFavorite())
                .hidden(templateDto.isHidden())
                .immutable(templateDto.isImmutable())
                .items(templateDto.getItems())
                .createdAt(templateDto.getCreatedAt())
                .updatedAt(templateDto.getUpdatedAt())
                .build();

        when(templateService.updateTemplate(any(), any())).thenReturn(updated);

        mockMvc.perform(patch("/templates/" + templateDto.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    @DisplayName("PATCH /templates/{id}/preferences updates preference flags")
    @WithMockUser
    void updatePreferences_returnsDto() throws Exception {
        RecipeTemplatePreferencesRequest pref = RecipeTemplatePreferencesRequest.builder()
                .favorite(true)
                .build();
        RecipeTemplateDto favoriteDto = RecipeTemplateDto.builder()
                .id(templateDto.getId())
                .name(templateDto.getName())
                .description(templateDto.getDescription())
                .tags(templateDto.getTags())
                .dietaryTags(templateDto.getDietaryTags())
                .source(templateDto.getSource())
                .favorite(true)
                .hidden(templateDto.isHidden())
                .immutable(templateDto.isImmutable())
                .items(templateDto.getItems())
                .createdAt(templateDto.getCreatedAt())
                .updatedAt(templateDto.getUpdatedAt())
                .build();

        when(templateService.updatePreferences(any(), any()))
                .thenReturn(favoriteDto);

        mockMvc.perform(patch("/templates/" + templateDto.getId() + "/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pref)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.favorite").value(true));
    }

    @Test
    @DisplayName("POST /templates/{id}/duplicate returns new recipe")
    @WithMockUser
    void duplicateTemplate_returnsRecipe() throws Exception {
        when(templateService.duplicateTemplate(any(), any())).thenReturn(duplicatedRecipe);

        RecipeTemplateDuplicateRequest request = RecipeTemplateDuplicateRequest.builder()
                .name("Duped")
                .build();

        mockMvc.perform(post("/templates/" + templateDto.getId() + "/duplicate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Duped"));
    }
}
