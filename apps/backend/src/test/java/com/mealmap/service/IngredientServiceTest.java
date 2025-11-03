package com.mealmap.service;

import com.mealmap.model.dto.ingredient.*;
import com.mealmap.model.embedded.PackageSize;
import com.mealmap.model.entity.Category;
import com.mealmap.model.entity.Ingredient;
import com.mealmap.model.entity.User;
import com.mealmap.model.enums.Unit;
import com.mealmap.repository.CategoryRepository;
import com.mealmap.repository.IngredientRepository;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("IngredientService Tests")
@SuppressWarnings("null")
class IngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private IngredientService ingredientService;

    private User testUser;
    private Category testCategory;
    private Ingredient testIngredient;
    private CreateIngredientRequest createRequest;
    private UpdateIngredientRequest updateRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .displayName("Test User")
                .build();

        testCategory = Category.builder()
                .id(UUID.randomUUID())
                .name("Dairy & Eggs")
                .sortOrder(1)
                .build();

        testIngredient = Ingredient.builder()
                .id(UUID.randomUUID())
                .ownerUserId(testUser.getId())
                .name("Milk")
                .category(testCategory)
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
        createRequest.setCategoryId(testCategory.getId());
        createRequest.setDefaultUnit(Unit.l);
        createRequest.setPackageSize(PackageSize.builder()
                .amount(BigDecimal.ONE)
                .unit(Unit.l)
                .build());
        createRequest.setNotes("Fresh milk");

        updateRequest = new UpdateIngredientRequest();
        updateRequest.setName("Whole Milk");

        // Setup security context
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
    }

    @Test
    @DisplayName("Should get ingredients with pagination")
    void shouldGetIngredientsWithPagination() {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        Page<Ingredient> page = new PageImpl<>(ingredients);
        when(ingredientRepository.findByOwnerUserId(eq(testUser.getId()), any(Pageable.class)))
                .thenReturn(page);

        // When
        IngredientPageResponse response = ingredientService.getIngredients(20, null, null, null);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getData()).hasSize(1);
        assertThat(response.getData().get(0).getName()).isEqualTo("Milk");
        assertThat(response.getNextCursor()).isNull(); // No next page

        verify(ingredientRepository).findByOwnerUserId(eq(testUser.getId()), any(Pageable.class));
    }

    @Test
    @DisplayName("Should search ingredients by name")
    void shouldSearchIngredientsByName() {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        Page<Ingredient> page = new PageImpl<>(ingredients);
        when(ingredientRepository.findByOwnerUserIdAndNameContainingIgnoreCase(
                eq(testUser.getId()), eq("milk"), any(Pageable.class)))
                .thenReturn(page);

        // When
        IngredientPageResponse response = ingredientService.getIngredients(20, null, "milk", null);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getData()).hasSize(1);
        assertThat(response.getData().get(0).getName()).isEqualTo("Milk");

        verify(ingredientRepository).findByOwnerUserIdAndNameContainingIgnoreCase(
                eq(testUser.getId()), eq("milk"), any(Pageable.class));
    }

    @Test
    @DisplayName("Should filter ingredients by category")
    void shouldFilterIngredientsByCategory() {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        Page<Ingredient> page = new PageImpl<>(ingredients);
        when(ingredientRepository.findByOwnerUserIdAndCategoryId(
                eq(testUser.getId()), eq(testCategory.getId()), any(Pageable.class)))
                .thenReturn(page);

        // When
        IngredientPageResponse response = ingredientService.getIngredients(20, null, null, testCategory.getId());

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getData()).hasSize(1);

        verify(ingredientRepository).findByOwnerUserIdAndCategoryId(
                eq(testUser.getId()), eq(testCategory.getId()), any(Pageable.class));
    }

    @Test
    @DisplayName("Should get ingredient by id")
    void shouldGetIngredientById() {
        // Given
        when(ingredientRepository.findById(testIngredient.getId())).thenReturn(Optional.of(testIngredient));

        // When
        IngredientDto result = ingredientService.getIngredientById(testIngredient.getId());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testIngredient.getId());
        assertThat(result.getName()).isEqualTo("Milk");
        assertThat(result.getCategoryId()).isEqualTo(testCategory.getId());

        verify(ingredientRepository).findById(testIngredient.getId());
    }

    @Test
    @DisplayName("Should throw exception when ingredient not found")
    void shouldThrowExceptionWhenIngredientNotFound() {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        when(ingredientRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> ingredientService.getIngredientById(nonExistentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Ingredient not found");

        verify(ingredientRepository).findById(nonExistentId);
    }

    @Test
    @DisplayName("Should throw exception when accessing another user's ingredient")
    void shouldThrowExceptionWhenAccessingAnotherUsersIngredient() {
        // Given
        UUID otherUserId = UUID.randomUUID();
        Ingredient otherUserIngredient = Ingredient.builder()
                .id(UUID.randomUUID())
                .ownerUserId(otherUserId)
                .name("Other Milk")
                .category(testCategory)
                .defaultUnit(Unit.l)
                .packageSize(PackageSize.builder().amount(BigDecimal.ONE).unit(Unit.l).build())
                .build();

        when(ingredientRepository.findById(otherUserIngredient.getId()))
                .thenReturn(Optional.of(otherUserIngredient));

        // When & Then
        assertThatThrownBy(() -> ingredientService.getIngredientById(otherUserIngredient.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Not authorized");

        verify(ingredientRepository).findById(otherUserIngredient.getId());
    }

    @Test
    @DisplayName("Should create ingredient successfully")
    void shouldCreateIngredientSuccessfully() {
        // Given
        when(categoryRepository.findById(testCategory.getId())).thenReturn(Optional.of(testCategory));
        when(ingredientRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        IngredientDto result = ingredientService.createIngredient(createRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Milk");
        assertThat(result.getOwnerUserId()).isEqualTo(testUser.getId());

        verify(categoryRepository).findById(testCategory.getId());
        verify(ingredientRepository).save(any(Ingredient.class));
    }

    @Test
    @DisplayName("Should throw exception when category not found during creation")
    void shouldThrowExceptionWhenCategoryNotFoundDuringCreation() {
        // Given
        when(categoryRepository.findById(testCategory.getId())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> ingredientService.createIngredient(createRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Category not found");

        verify(categoryRepository).findById(testCategory.getId());
        verify(ingredientRepository, never()).save(any(Ingredient.class));
    }

    @Test
    @DisplayName("Should update ingredient successfully")
    void shouldUpdateIngredientSuccessfully() {
        // Given
        when(ingredientRepository.findById(testIngredient.getId())).thenReturn(Optional.of(testIngredient));
        when(ingredientRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        IngredientDto result = ingredientService.updateIngredient(testIngredient.getId(), updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(ingredientRepository).findById(testIngredient.getId());
        verify(ingredientRepository).save(testIngredient);
    }

    @Test
    @DisplayName("Should delete ingredient successfully")
    void shouldDeleteIngredientSuccessfully() {
        // Given
        when(ingredientRepository.findById(testIngredient.getId())).thenReturn(Optional.of(testIngredient));

        // When
        ingredientService.deleteIngredient(testIngredient.getId());

        // Then
        verify(ingredientRepository).findById(testIngredient.getId());
        verify(ingredientRepository).delete(testIngredient);
    }

    @Test
    @DisplayName("Should throw exception when deleting another user's ingredient")
    void shouldThrowExceptionWhenDeletingAnotherUsersIngredient() {
        // Given
        UUID otherUserId = UUID.randomUUID();
        Ingredient otherUserIngredient = Ingredient.builder()
                .id(UUID.randomUUID())
                .ownerUserId(otherUserId)
                .name("Other Milk")
                .category(testCategory)
                .defaultUnit(Unit.l)
                .packageSize(PackageSize.builder().amount(BigDecimal.ONE).unit(Unit.l).build())
                .build();

        when(ingredientRepository.findById(otherUserIngredient.getId()))
                .thenReturn(Optional.of(otherUserIngredient));

        // When & Then
        assertThatThrownBy(() -> ingredientService.deleteIngredient(otherUserIngredient.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Not authorized");

        verify(ingredientRepository).findById(otherUserIngredient.getId());
        verify(ingredientRepository, never()).delete(any(Ingredient.class));
    }
}
