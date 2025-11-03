package com.mealmap.service;

import com.mealmap.model.dto.recipe.*;
import com.mealmap.model.embedded.Quantity;
import com.mealmap.model.entity.Recipe;
import com.mealmap.model.entity.RecipeItem;
import com.mealmap.model.entity.User;
import com.mealmap.model.enums.Unit;
import com.mealmap.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecipeService Tests")
@SuppressWarnings("null")
class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RecipeService recipeService;

    private User testUser;
    private Recipe testRecipe;
    private CreateRecipeRequest createRequest;
    private UpdateRecipeRequest updateRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .displayName("Test User")
                .build();

        RecipeItem recipeItem = RecipeItem.builder()
                .id(UUID.randomUUID())
                .ingredientId(UUID.randomUUID())
                .quantity(Quantity.builder()
                        .amount(new BigDecimal("0.5"))
                        .unit(Unit.kg)
                        .build())
                .packageNote("Fresh")
                .build();

        testRecipe = Recipe.builder()
                .id(UUID.randomUUID())
                .ownerUserId(testUser.getId())
                .name("Grilled Chicken")
                .externalUrl("https://example.com/recipe")
                .items(new ArrayList<>(Arrays.asList(recipeItem)))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        recipeItem.setRecipe(testRecipe);

        RecipeItemDto itemDto = new RecipeItemDto();
        itemDto.setIngredientId(UUID.randomUUID());
        itemDto.setQuantity(Quantity.builder()
                .amount(new BigDecimal("0.5"))
                .unit(Unit.kg)
                .build());
        itemDto.setPackageNote("Fresh");

        createRequest = new CreateRecipeRequest();
        createRequest.setName("Grilled Chicken");
        createRequest.setExternalUrl("https://example.com/recipe");
        createRequest.setItems(Arrays.asList(itemDto));

        updateRequest = new UpdateRecipeRequest();
        updateRequest.setName("BBQ Chicken");

        // Setup security context
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
    }

    @Test
    @DisplayName("Should get recipes with pagination")
    void shouldGetRecipesWithPagination() {
        // Given
        List<Recipe> recipes = Arrays.asList(testRecipe);
        Page<Recipe> page = new PageImpl<>(recipes);
        when(recipeRepository.findByOwnerUserId(eq(testUser.getId()), any(Pageable.class)))
                .thenReturn(page);

        // When
        RecipePageResponse response = recipeService.getRecipes(20, null, null);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getData()).hasSize(1);
        assertThat(response.getData().get(0).getName()).isEqualTo("Grilled Chicken");
        assertThat(response.getData().get(0).getItems()).hasSize(1);
        assertThat(response.getNextCursor()).isNull();

        verify(recipeRepository).findByOwnerUserId(eq(testUser.getId()), any(Pageable.class));
    }

    @Test
    @DisplayName("Should search recipes by name")
    void shouldSearchRecipesByName() {
        // Given
        List<Recipe> recipes = Arrays.asList(testRecipe);
        Page<Recipe> page = new PageImpl<>(recipes);
        when(recipeRepository.findByOwnerUserIdAndNameContainingIgnoreCase(
                eq(testUser.getId()), eq("chicken"), any(Pageable.class)))
                .thenReturn(page);

        // When
        RecipePageResponse response = recipeService.getRecipes(20, null, "chicken");

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getData()).hasSize(1);
        assertThat(response.getData().get(0).getName()).isEqualTo("Grilled Chicken");

        verify(recipeRepository).findByOwnerUserIdAndNameContainingIgnoreCase(
                eq(testUser.getId()), eq("chicken"), any(Pageable.class));
    }

    @Test
    @DisplayName("Should get recipe by id")
    void shouldGetRecipeById() {
        // Given
        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));

        // When
        RecipeDto result = recipeService.getRecipeById(testRecipe.getId());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testRecipe.getId());
        assertThat(result.getName()).isEqualTo("Grilled Chicken");
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getExternalUrl()).isEqualTo("https://example.com/recipe");

        verify(recipeRepository).findById(testRecipe.getId());
    }

    @Test
    @DisplayName("Should throw exception when recipe not found")
    void shouldThrowExceptionWhenRecipeNotFound() {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(recipeRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> recipeService.getRecipeById(nonExistentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Recipe not found");

        verify(recipeRepository).findById(nonExistentId);
    }

    @Test
    @DisplayName("Should throw exception when accessing another user's recipe")
    void shouldThrowExceptionWhenAccessingAnotherUsersRecipe() {
        // Given
        UUID otherUserId = UUID.randomUUID();
        Recipe otherUserRecipe = Recipe.builder()
                .id(UUID.randomUUID())
                .ownerUserId(otherUserId)
                .name("Other Recipe")
                .items(new ArrayList<>())
                .build();

        when(recipeRepository.findById(otherUserRecipe.getId()))
                .thenReturn(Optional.of(otherUserRecipe));

        // When & Then
        assertThatThrownBy(() -> recipeService.getRecipeById(otherUserRecipe.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Not authorized");

        verify(recipeRepository).findById(otherUserRecipe.getId());
    }

    @Test
    @DisplayName("Should create recipe successfully")
    void shouldCreateRecipeSuccessfully() {
        // Given
        when(recipeRepository.save(any(Recipe.class))).thenReturn(testRecipe);

        // When
        RecipeDto result = recipeService.createRecipe(createRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Grilled Chicken");

        verify(recipeRepository).save(any(Recipe.class));
    }

    @Test
    @DisplayName("Should update recipe successfully")
    void shouldUpdateRecipeSuccessfully() {
        // Given
        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));
        when(recipeRepository.save(any(Recipe.class))).thenReturn(testRecipe);

        // When
        RecipeDto result = recipeService.updateRecipe(testRecipe.getId(), updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(recipeRepository).findById(testRecipe.getId());
        verify(recipeRepository).save(testRecipe);
    }

    @Test
    @DisplayName("Should update recipe items")
    void shouldUpdateRecipeItems() {
        // Given
        RecipeItemDto newItem = new RecipeItemDto();
        newItem.setIngredientId(UUID.randomUUID());
        newItem.setQuantity(Quantity.builder()
                .amount(new BigDecimal("1.0"))
                .unit(Unit.kg)
                .build());

        updateRequest.setItems(Arrays.asList(newItem));

        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));
        when(recipeRepository.save(any(Recipe.class))).thenReturn(testRecipe);

        // When
        RecipeDto result = recipeService.updateRecipe(testRecipe.getId(), updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(recipeRepository).findById(testRecipe.getId());
        verify(recipeRepository).save(testRecipe);
    }

    @Test
    @DisplayName("Should delete recipe successfully")
    void shouldDeleteRecipeSuccessfully() {
        // Given
        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));

        // When
        recipeService.deleteRecipe(testRecipe.getId());

        // Then
        verify(recipeRepository).findById(testRecipe.getId());
        verify(recipeRepository).delete(testRecipe);
    }

    @Test
    @DisplayName("Should throw exception when deleting another user's recipe")
    void shouldThrowExceptionWhenDeletingAnotherUsersRecipe() {
        // Given
        UUID otherUserId = UUID.randomUUID();
        Recipe otherUserRecipe = Recipe.builder()
                .id(UUID.randomUUID())
                .ownerUserId(otherUserId)
                .name("Other Recipe")
                .items(new ArrayList<>())
                .build();

        when(recipeRepository.findById(otherUserRecipe.getId()))
                .thenReturn(Optional.of(otherUserRecipe));

        // When & Then
        assertThatThrownBy(() -> recipeService.deleteRecipe(otherUserRecipe.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Not authorized");

        verify(recipeRepository).findById(otherUserRecipe.getId());
        verify(recipeRepository, never()).delete(any(Recipe.class));
    }

    @Test
    @DisplayName("Should map recipe to DTO with items correctly")
    void shouldMapRecipeToDtoWithItemsCorrectly() {
        // Given
        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));

        // When
        RecipeDto result = recipeService.getRecipeById(testRecipe.getId());

        // Then
        assertThat(result.getId()).isEqualTo(testRecipe.getId());
        assertThat(result.getName()).isEqualTo(testRecipe.getName());
        assertThat(result.getExternalUrl()).isEqualTo(testRecipe.getExternalUrl());
        assertThat(result.getItems()).hasSize(1);
        
        RecipeItemDto itemDto = result.getItems().get(0);
        RecipeItem originalItem = testRecipe.getItems().get(0);
        assertThat(itemDto.getIngredientId()).isEqualTo(originalItem.getIngredientId());
        assertThat(itemDto.getQuantity().getAmount()).isEqualTo(originalItem.getQuantity().getAmount());
        assertThat(itemDto.getQuantity().getUnit()).isEqualTo(originalItem.getQuantity().getUnit());
        assertThat(itemDto.getPackageNote()).isEqualTo(originalItem.getPackageNote());
    }
}
