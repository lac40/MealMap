package com.mealmap.service;

import com.mealmap.model.dto.CategoryDto;
import com.mealmap.model.entity.Category;
import com.mealmap.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private List<Category> testCategories;

    @BeforeEach
    void setUp() {
        testCategories = Arrays.asList(
                Category.builder()
                        .id(UUID.randomUUID())
                        .name("Dairy & Eggs")
                        .sortOrder(1)
                        .build(),
                Category.builder()
                        .id(UUID.randomUUID())
                        .name("Meat & Fish")
                        .sortOrder(2)
                        .build(),
                Category.builder()
                        .id(UUID.randomUUID())
                        .name("Fruits & Vegetables")
                        .sortOrder(3)
                        .build()
        );
    }

    @Test
    @DisplayName("Should return all categories")
    void shouldReturnAllCategories() {
        // Given
        when(categoryRepository.findAll()).thenReturn(testCategories);

        // When
        List<CategoryDto> result = categoryService.getAllCategories();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getName()).isEqualTo("Dairy & Eggs");
        assertThat(result.get(0).getSortOrder()).isEqualTo(1);
        assertThat(result.get(1).getName()).isEqualTo("Meat & Fish");
        assertThat(result.get(2).getName()).isEqualTo("Fruits & Vegetables");

        verify(categoryRepository).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no categories exist")
    void shouldReturnEmptyListWhenNoCategoriesExist() {
        // Given
        when(categoryRepository.findAll()).thenReturn(Arrays.asList());

        // When
        List<CategoryDto> result = categoryService.getAllCategories();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        verify(categoryRepository).findAll();
    }

    @Test
    @DisplayName("Should map category entity to DTO correctly")
    void shouldMapCategoryEntityToDtoCorrectly() {
        // Given
        when(categoryRepository.findAll()).thenReturn(testCategories);

        // When
        List<CategoryDto> result = categoryService.getAllCategories();

        // Then
        CategoryDto firstCategory = result.get(0);
        assertThat(firstCategory.getId()).isEqualTo(testCategories.get(0).getId());
        assertThat(firstCategory.getName()).isEqualTo(testCategories.get(0).getName());
        assertThat(firstCategory.getSortOrder()).isEqualTo(testCategories.get(0).getSortOrder());
    }
}
