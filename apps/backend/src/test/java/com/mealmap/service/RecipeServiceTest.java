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
@DisplayName("Recipe Service Business Logic Tests")
@SuppressWarnings("null")
class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private com.mealmap.repository.UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private org.springframework.security.core.userdetails.UserDetails userDetails;

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
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("Should retrieve all user recipes with pagination when requested by authenticated user")
    void shouldRetrieveAllUserRecipesWithPaginationWhenRequestedByAuthenticatedUser() {
        // Given - authenticated user has recipes in database
        List<Recipe> recipes = Arrays.asList(testRecipe);
        Page<Recipe> page = new PageImpl<>(recipes);
        when(recipeRepository.findByOwnerUserId(eq(testUser.getId()), any(Pageable.class)))
                .thenReturn(page);

        // When - user requests their recipes
        RecipePageResponse response = recipeService.getRecipes(20, null, null);

        // Then - response contains user's recipes with correct pagination
        assertThat(response)
                .isNotNull()
                .satisfies(r -> {
                    assertThat(r.getData()).hasSize(1);
                    assertThat(r.getNextCursor()).isNull();
                });
        assertThat(response.getData().get(0))
                .satisfies(recipe -> {
                    assertThat(recipe.getName()).isEqualTo("Grilled Chicken");
                    assertThat(recipe.getItems()).hasSize(1);
                    assertThat(recipe.getId()).isEqualTo(testRecipe.getId());
                });

        verify(recipeRepository).findByOwnerUserId(eq(testUser.getId()), any(Pageable.class));
    }

    @Test
    @DisplayName("Should filter user recipes by name using case-insensitive search when search query is provided")
    void shouldFilterUserRecipesByNameUsingCaseInsensitiveSearchWhenSearchQueryProvided() {
        // Given - user has recipe matching search term
        List<Recipe> recipes = Arrays.asList(testRecipe);
        Page<Recipe> page = new PageImpl<>(recipes);
        when(recipeRepository.findByOwnerUserIdAndNameContainingIgnoreCase(
                eq(testUser.getId()), eq("chicken"), any(Pageable.class)))
                .thenReturn(page);

        // When - user searches for recipes containing "chicken"
        RecipePageResponse response = recipeService.getRecipes(20, null, "chicken");

        // Then - only matching recipes are returned
        assertThat(response).isNotNull();
        assertThat(response.getData())
                .hasSize(1)
                .allSatisfy(recipe -> 
                    assertThat(recipe.getName().toLowerCase()).contains("chicken")
                );
        assertThat(response.getData().get(0).getName()).isEqualTo("Grilled Chicken");

        verify(recipeRepository).findByOwnerUserIdAndNameContainingIgnoreCase(
                eq(testUser.getId()), eq("chicken"), any(Pageable.class));
    }

    @Test
    @DisplayName("Should retrieve complete recipe details including all ingredients when valid recipe ID is requested by owner")
    void shouldRetrieveCompleteRecipeDetailsIncludingAllIngredientsWhenValidRecipeIdRequestedByOwner() {
        // Given - recipe exists and belongs to authenticated user
        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));

        // When - user requests recipe by ID
        RecipeDto result = recipeService.getRecipeById(testRecipe.getId());

        // Then - complete recipe data is returned with all ingredients
        assertThat(result)
                .isNotNull()
                .satisfies(recipe -> {
                    assertThat(recipe.getId()).isEqualTo(testRecipe.getId());
                    assertThat(recipe.getName()).isEqualTo("Grilled Chicken");
                    assertThat(recipe.getExternalUrl()).isEqualTo("https://example.com/recipe");
                    assertThat(recipe.getItems())
                            .isNotEmpty()
                            .hasSize(1)
                            .allSatisfy(item -> {
                                assertThat(item.getIngredientId()).isNotNull();
                                assertThat(item.getQuantity()).isNotNull();
                                assertThat(item.getQuantity().getAmount()).isPositive();
                            });
                });

        verify(recipeRepository).findById(testRecipe.getId());
    }

    @Test
    @DisplayName("Should throw not found exception with appropriate error message when recipe ID does not exist in database")
    void shouldThrowNotFoundExceptionWithAppropriateErrorMessageWhenRecipeIdDoesNotExistInDatabase() {
        // Given - recipe ID does not exist in database
        UUID nonExistentId = UUID.randomUUID();
        when(recipeRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When - user attempts to retrieve non-existent recipe
        // Then - appropriate exception is thrown with clear error message
        assertThatThrownBy(() -> recipeService.getRecipeById(nonExistentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Recipe not found")
                .satisfies(exception -> {
                    ResponseStatusException rse = (ResponseStatusException) exception;
                    assertThat(rse.getStatusCode().value()).isEqualTo(404);
                });

        verify(recipeRepository).findById(nonExistentId);
        verify(recipeRepository, never()).save(any(Recipe.class));
    }

    @Test
    @DisplayName("Should deny access and throw authorization exception when user attempts to view another user's private recipe")
    void shouldDenyAccessAndThrowAuthorizationExceptionWhenUserAttemptsToViewAnotherUsersPrivateRecipe() {
        // Given - recipe belongs to different user
        UUID otherUserId = UUID.randomUUID();
        Recipe otherUserRecipe = Recipe.builder()
                .id(UUID.randomUUID())
                .ownerUserId(otherUserId)
                .name("Other User's Recipe")
                .items(new ArrayList<>())
                .build();

        when(recipeRepository.findById(otherUserRecipe.getId()))
                .thenReturn(Optional.of(otherUserRecipe));

        // When - authenticated user attempts to access recipe they don't own
        // Then - access is denied with authorization error
        assertThatThrownBy(() -> recipeService.getRecipeById(otherUserRecipe.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Not authorized")
                .satisfies(exception -> {
                    ResponseStatusException rse = (ResponseStatusException) exception;
                    assertThat(rse.getStatusCode().value()).isEqualTo(403);
                });

        verify(recipeRepository).findById(otherUserRecipe.getId());
        verify(recipeRepository, never()).save(any(Recipe.class));
        verify(recipeRepository, never()).delete(any(Recipe.class));
    }

    @Test
    @DisplayName("Should create new recipe with all provided details and associate it with authenticated user")
    void shouldCreateNewRecipeWithAllProvidedDetailsAndAssociateItWithAuthenticatedUser() {
        // Given - valid recipe creation request from authenticated user
        when(recipeRepository.save(any(Recipe.class))).thenReturn(testRecipe);

        // When - user creates new recipe
        RecipeDto result = recipeService.createRecipe(createRequest);

        // Then - recipe is persisted with all details and associated with user
        assertThat(result)
                .isNotNull()
                .satisfies(recipe -> {
                    assertThat(recipe.getName()).isEqualTo("Grilled Chicken");
                    assertThat(recipe.getId()).isNotNull();
                    assertThat(recipe.getExternalUrl()).isNotBlank();
                    assertThat(recipe.getItems()).isNotEmpty();
                });

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
    @DisplayName("Should permanently remove recipe from database when owner requests deletion")
    void shouldPermanentlyRemoveRecipeFromDatabaseWhenOwnerRequestsDeletion() {
        // Given - recipe exists and belongs to authenticated user
        when(recipeRepository.findById(testRecipe.getId())).thenReturn(Optional.of(testRecipe));

        // When - owner requests recipe deletion
        recipeService.deleteRecipe(testRecipe.getId());

        // Then - recipe is permanently removed from database
        verify(recipeRepository).findById(testRecipe.getId());
        verify(recipeRepository).delete(testRecipe);
        verify(recipeRepository, times(1)).delete(any(Recipe.class));
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
