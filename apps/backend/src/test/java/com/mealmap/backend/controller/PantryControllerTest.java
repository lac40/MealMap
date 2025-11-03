package com.mealmap.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mealmap.backend.dto.pantry.CreatePantryItemRequest;
import com.mealmap.backend.dto.pantry.PantryItemDto;
import com.mealmap.backend.dto.pantry.PantryItemPageResponse;
import com.mealmap.backend.dto.pantry.UpdatePantryItemRequest;
import com.mealmap.backend.exception.ResourceNotFoundException;
import com.mealmap.backend.exception.UnauthorizedException;
import com.mealmap.backend.service.PantryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PantryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PantryService pantryService;

    @Test
    @WithMockUser
    void getPantryItems_ShouldReturnPageOfItems() throws Exception {
        // Arrange
        PantryItemDto item1 = createPantryItemDto(1L, 1L, "Milk", new BigDecimal("500"), "ml");
        PantryItemDto item2 = createPantryItemDto(2L, 2L, "Butter", new BigDecimal("250"), "g");
        
        PantryItemPageResponse response = new PantryItemPageResponse();
        response.setItems(Arrays.asList(item1, item2));
        response.setTotalElements(2L);
        response.setTotalPages(1);
        response.setCurrentPage(0);
        response.setPageSize(20);
        
        when(pantryService.getPantryItems(any(Pageable.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/v1/pantry")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items", hasSize(2)))
            .andExpect(jsonPath("$.items[0].id", is(1)))
            .andExpect(jsonPath("$.items[0].ingredient.name", is("Milk")))
            .andExpect(jsonPath("$.items[1].id", is(2)))
            .andExpect(jsonPath("$.items[1].ingredient.name", is("Butter")))
            .andExpect(jsonPath("$.totalElements", is(2)))
            .andExpect(jsonPath("$.totalPages", is(1)));

        verify(pantryService).getPantryItems(any(Pageable.class));
    }

    @Test
    @WithMockUser
    void getPantryItemById_WhenItemExists_ShouldReturnItem() throws Exception {
        // Arrange
        PantryItemDto item = createPantryItemDto(1L, 1L, "Milk", new BigDecimal("500"), "ml");
        when(pantryService.getPantryItemById(1L)).thenReturn(item);

        // Act & Assert
        mockMvc.perform(get("/v1/pantry/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.ingredient.name", is("Milk")))
            .andExpect(jsonPath("$.quantity.amount", is(500)))
            .andExpect(jsonPath("$.quantity.unit", is("ml")));

        verify(pantryService).getPantryItemById(1L);
    }

    @Test
    @WithMockUser
    void getPantryItemById_WhenItemNotExists_ShouldReturn404() throws Exception {
        // Arrange
        when(pantryService.getPantryItemById(999L))
            .thenThrow(new ResourceNotFoundException("Pantry item not found with id: 999"));

        // Act & Assert
        mockMvc.perform(get("/v1/pantry/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title", is("Not Found")))
            .andExpect(jsonPath("$.detail", is("Pantry item not found with id: 999")));

        verify(pantryService).getPantryItemById(999L);
    }

    @Test
    @WithMockUser
    void getPantryItemById_WhenUserHasNoAccess_ShouldReturn403() throws Exception {
        // Arrange
        when(pantryService.getPantryItemById(1L))
            .thenThrow(new UnauthorizedException("You don't have access to this pantry item"));

        // Act & Assert
        mockMvc.perform(get("/v1/pantry/1"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.title", is("Forbidden")))
            .andExpect(jsonPath("$.detail", is("You don't have access to this pantry item")));

        verify(pantryService).getPantryItemById(1L);
    }

    @Test
    @WithMockUser
    void createPantryItem_WithValidData_ShouldCreateItem() throws Exception {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(1L);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        PantryItemDto createdItem = createPantryItemDto(1L, 1L, "Milk", new BigDecimal("500"), "ml");
        when(pantryService.createPantryItem(any(CreatePantryItemRequest.class))).thenReturn(createdItem);

        // Act & Assert
        mockMvc.perform(post("/v1/pantry")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.ingredient.name", is("Milk")))
            .andExpect(jsonPath("$.quantity.amount", is(500)))
            .andExpect(jsonPath("$.quantity.unit", is("ml")));

        verify(pantryService).createPantryItem(any(CreatePantryItemRequest.class));
    }

    @Test
    @WithMockUser
    void createPantryItem_WithInvalidData_ShouldReturn400() throws Exception {
        // Arrange - missing required fields
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        // ingredientId is null

        // Act & Assert
        mockMvc.perform(post("/v1/pantry")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void createPantryItem_WithNonExistentIngredient_ShouldReturn404() throws Exception {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(999L);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        when(pantryService.createPantryItem(any(CreatePantryItemRequest.class)))
            .thenThrow(new ResourceNotFoundException("Ingredient not found with id: 999"));

        // Act & Assert
        mockMvc.perform(post("/v1/pantry")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title", is("Not Found")))
            .andExpect(jsonPath("$.detail", is("Ingredient not found with id: 999")));
    }

    @Test
    @WithMockUser
    void createPantryItem_WithUnauthorizedHousehold_ShouldReturn403() throws Exception {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(1L);
        request.setHouseholdId(999L);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        when(pantryService.createPantryItem(any(CreatePantryItemRequest.class)))
            .thenThrow(new UnauthorizedException("You don't have access to this household"));

        // Act & Assert
        mockMvc.perform(post("/v1/pantry")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.title", is("Forbidden")))
            .andExpect(jsonPath("$.detail", is("You don't have access to this household")));
    }

    @Test
    @WithMockUser
    void updatePantryItem_WithValidData_ShouldUpdateItem() throws Exception {
        // Arrange
        UpdatePantryItemRequest request = new UpdatePantryItemRequest();
        request.setQuantityAmount(new BigDecimal("1000"));
        request.setQuantityUnit("ml");
        
        PantryItemDto updatedItem = createPantryItemDto(1L, 1L, "Milk", new BigDecimal("1000"), "ml");
        when(pantryService.updatePantryItem(eq(1L), any(UpdatePantryItemRequest.class))).thenReturn(updatedItem);

        // Act & Assert
        mockMvc.perform(patch("/v1/pantry/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.quantity.amount", is(1000)))
            .andExpect(jsonPath("$.quantity.unit", is("ml")));

        verify(pantryService).updatePantryItem(eq(1L), any(UpdatePantryItemRequest.class));
    }

    @Test
    @WithMockUser
    void updatePantryItem_WhenItemNotExists_ShouldReturn404() throws Exception {
        // Arrange
        UpdatePantryItemRequest request = new UpdatePantryItemRequest();
        request.setQuantityAmount(new BigDecimal("1000"));
        request.setQuantityUnit("ml");
        
        when(pantryService.updatePantryItem(eq(999L), any(UpdatePantryItemRequest.class)))
            .thenThrow(new ResourceNotFoundException("Pantry item not found with id: 999"));

        // Act & Assert
        mockMvc.perform(patch("/v1/pantry/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title", is("Not Found")))
            .andExpect(jsonPath("$.detail", is("Pantry item not found with id: 999")));
    }

    @Test
    @WithMockUser
    void updatePantryItem_WhenUserHasNoAccess_ShouldReturn403() throws Exception {
        // Arrange
        UpdatePantryItemRequest request = new UpdatePantryItemRequest();
        request.setQuantityAmount(new BigDecimal("1000"));
        request.setQuantityUnit("ml");
        
        when(pantryService.updatePantryItem(eq(1L), any(UpdatePantryItemRequest.class)))
            .thenThrow(new UnauthorizedException("You don't have access to this pantry item"));

        // Act & Assert
        mockMvc.perform(patch("/v1/pantry/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.title", is("Forbidden")))
            .andExpect(jsonPath("$.detail", is("You don't have access to this pantry item")));
    }

    @Test
    @WithMockUser
    void deletePantryItem_WhenItemExists_ShouldDeleteItem() throws Exception {
        // Arrange
        doNothing().when(pantryService).deletePantryItem(1L);

        // Act & Assert
        mockMvc.perform(delete("/v1/pantry/1"))
            .andExpect(status().isNoContent());

        verify(pantryService).deletePantryItem(1L);
    }

    @Test
    @WithMockUser
    void deletePantryItem_WhenItemNotExists_ShouldReturn404() throws Exception {
        // Arrange
        doThrow(new ResourceNotFoundException("Pantry item not found with id: 999"))
            .when(pantryService).deletePantryItem(999L);

        // Act & Assert
        mockMvc.perform(delete("/v1/pantry/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title", is("Not Found")))
            .andExpect(jsonPath("$.detail", is("Pantry item not found with id: 999")));

        verify(pantryService).deletePantryItem(999L);
    }

    @Test
    @WithMockUser
    void deletePantryItem_WhenUserHasNoAccess_ShouldReturn403() throws Exception {
        // Arrange
        doThrow(new UnauthorizedException("You don't have access to this pantry item"))
            .when(pantryService).deletePantryItem(1L);

        // Act & Assert
        mockMvc.perform(delete("/v1/pantry/1"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.title", is("Forbidden")))
            .andExpect(jsonPath("$.detail", is("You don't have access to this pantry item")));

        verify(pantryService).deletePantryItem(1L);
    }

    // Helper method
    private PantryItemDto createPantryItemDto(Long id, Long ingredientId, String ingredientName, 
                                             BigDecimal amount, String unit) {
        PantryItemDto dto = new PantryItemDto();
        dto.setId(id);
        
        PantryItemDto.IngredientSummary ingredient = new PantryItemDto.IngredientSummary();
        ingredient.setId(ingredientId);
        ingredient.setName(ingredientName);
        dto.setIngredient(ingredient);
        
        PantryItemDto.QuantityDto quantity = new PantryItemDto.QuantityDto();
        quantity.setAmount(amount);
        quantity.setUnit(unit);
        dto.setQuantity(quantity);
        
        return dto;
    }
}
