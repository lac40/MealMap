package com.mealmap.backend.service;

import com.mealmap.backend.dto.pantry.CreatePantryItemRequest;
import com.mealmap.backend.dto.pantry.PantryItemDto;
import com.mealmap.backend.dto.pantry.PantryItemPageResponse;
import com.mealmap.backend.dto.pantry.UpdatePantryItemRequest;
import com.mealmap.backend.entity.*;
import com.mealmap.backend.exception.ResourceNotFoundException;
import com.mealmap.backend.exception.UnauthorizedException;
import com.mealmap.backend.mapper.PantryMapper;
import com.mealmap.backend.repository.IngredientRepository;
import com.mealmap.backend.repository.PantryItemRepository;
import com.mealmap.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PantryServiceTest {

    @Mock
    private PantryItemRepository pantryItemRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PantryMapper pantryMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PantryService pantryService;

    private User testUser;
    private Household testHousehold;
    private Ingredient testIngredient;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");

        testHousehold = new Household();
        testHousehold.setId(1L);
        testHousehold.setName("Test Household");
        testHousehold.getMembers().add(testUser);

        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Dairy");

        testIngredient = new Ingredient();
        testIngredient.setId(1L);
        testIngredient.setName("Milk");
        testIngredient.setCategory(testCategory);

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    }

    @Test
    void getPantryItems_ShouldReturnUserAndHouseholdItems() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        
        PantryItem userItem = createPantryItem(1L, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItem householdItem = createPantryItem(2L, null, testHousehold, testIngredient, new BigDecimal("1"), "l");
        
        List<PantryItem> items = Arrays.asList(userItem, householdItem);
        Page<PantryItem> page = new PageImpl<>(items, pageable, items.size());
        
        when(pantryItemRepository.findByUserIdOrUserHouseholdId(eq(1L), eq(1L), any(Pageable.class)))
            .thenReturn(page);
        
        PantryItemDto userItemDto = new PantryItemDto();
        userItemDto.setId(1L);
        PantryItemDto householdItemDto = new PantryItemDto();
        householdItemDto.setId(2L);
        
        when(pantryMapper.toDto(userItem)).thenReturn(userItemDto);
        when(pantryMapper.toDto(householdItem)).thenReturn(householdItemDto);

        // Act
        PantryItemPageResponse response = pantryService.getPantryItems(pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getItems()).hasSize(2);
        assertThat(response.getTotalElements()).isEqualTo(2);
        assertThat(response.getTotalPages()).isEqualTo(1);
        verify(pantryItemRepository).findByUserIdOrUserHouseholdId(eq(1L), eq(1L), any(Pageable.class));
    }

    @Test
    void getPantryItemById_WhenItemExists_ShouldReturnItem() {
        // Arrange
        PantryItem pantryItem = createPantryItem(1L, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItemDto dto = new PantryItemDto();
        dto.setId(1L);
        
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.of(pantryItem));
        when(pantryMapper.toDto(pantryItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.getPantryItemById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(pantryItemRepository).findById(1L);
    }

    @Test
    void getPantryItemById_WhenItemNotExists_ShouldThrowException() {
        // Arrange
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pantryService.getPantryItemById(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Pantry item not found with id: 1");
    }

    @Test
    void getPantryItemById_WhenUserHasNoAccess_ShouldThrowException() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");
        
        PantryItem pantryItem = createPantryItem(1L, otherUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.of(pantryItem));

        // Act & Assert
        assertThatThrownBy(() -> pantryService.getPantryItemById(1L))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("You don't have access to this pantry item");
    }

    @Test
    void createPantryItem_WithUserOwnership_ShouldCreateItem() {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(1L);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        PantryItem pantryItem = createPantryItem(null, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItem savedItem = createPantryItem(1L, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        PantryItemDto dto = new PantryItemDto();
        dto.setId(1L);
        
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(pantryMapper.toEntity(request)).thenReturn(pantryItem);
        when(pantryItemRepository.save(pantryItem)).thenReturn(savedItem);
        when(pantryMapper.toDto(savedItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.createPantryItem(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(ingredientRepository).findById(1L);
        verify(pantryItemRepository).save(pantryItem);
        assertThat(pantryItem.getUser()).isEqualTo(testUser);
        assertThat(pantryItem.getIngredient()).isEqualTo(testIngredient);
    }

    @Test
    void createPantryItem_WithHouseholdOwnership_ShouldCreateItem() {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(1L);
        request.setHouseholdId(1L);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        PantryItem pantryItem = createPantryItem(null, null, testHousehold, testIngredient, new BigDecimal("500"), "ml");
        PantryItem savedItem = createPantryItem(1L, null, testHousehold, testIngredient, new BigDecimal("500"), "ml");
        
        PantryItemDto dto = new PantryItemDto();
        dto.setId(1L);
        
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(pantryMapper.toEntity(request)).thenReturn(pantryItem);
        when(pantryItemRepository.save(pantryItem)).thenReturn(savedItem);
        when(pantryMapper.toDto(savedItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.createPantryItem(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(pantryItemRepository).save(pantryItem);
        assertThat(pantryItem.getHousehold()).isEqualTo(testHousehold);
    }

    @Test
    void createPantryItem_WhenIngredientNotExists_ShouldThrowException() {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(999L);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        when(ingredientRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pantryService.createPantryItem(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Ingredient not found with id: 999");
    }

    @Test
    void createPantryItem_WhenHouseholdNotAccessible_ShouldThrowException() {
        // Arrange
        Household otherHousehold = new Household();
        otherHousehold.setId(2L);
        otherHousehold.setName("Other Household");
        
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(1L);
        request.setHouseholdId(2L);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        PantryItem pantryItem = createPantryItem(null, null, otherHousehold, testIngredient, new BigDecimal("500"), "ml");
        
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(pantryMapper.toEntity(request)).thenReturn(pantryItem);

        // Act & Assert
        assertThatThrownBy(() -> pantryService.createPantryItem(request))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("You don't have access to this household");
    }

    @Test
    void updatePantryItem_ShouldUpdateItem() {
        // Arrange
        UpdatePantryItemRequest request = new UpdatePantryItemRequest();
        request.setQuantityAmount(new BigDecimal("1000"));
        request.setQuantityUnit("ml");
        
        PantryItem pantryItem = createPantryItem(1L, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItem updatedItem = createPantryItem(1L, testUser, null, testIngredient, new BigDecimal("1000"), "ml");
        
        PantryItemDto dto = new PantryItemDto();
        dto.setId(1L);
        
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.of(pantryItem));
        when(pantryItemRepository.save(pantryItem)).thenReturn(updatedItem);
        when(pantryMapper.toDto(updatedItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.updatePantryItem(1L, request);

        // Assert
        assertThat(result).isNotNull();
        verify(pantryItemRepository).findById(1L);
        verify(pantryMapper).updateEntityFromDto(request, pantryItem);
        verify(pantryItemRepository).save(pantryItem);
    }

    @Test
    void updatePantryItem_WhenItemNotExists_ShouldThrowException() {
        // Arrange
        UpdatePantryItemRequest request = new UpdatePantryItemRequest();
        request.setQuantityAmount(new BigDecimal("1000"));
        request.setQuantityUnit("ml");
        
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pantryService.updatePantryItem(1L, request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Pantry item not found with id: 1");
    }

    @Test
    void updatePantryItem_WhenUserHasNoAccess_ShouldThrowException() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        
        UpdatePantryItemRequest request = new UpdatePantryItemRequest();
        request.setQuantityAmount(new BigDecimal("1000"));
        request.setQuantityUnit("ml");
        
        PantryItem pantryItem = createPantryItem(1L, otherUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.of(pantryItem));

        // Act & Assert
        assertThatThrownBy(() -> pantryService.updatePantryItem(1L, request))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("You don't have access to this pantry item");
    }

    @Test
    void deletePantryItem_ShouldDeleteItem() {
        // Arrange
        PantryItem pantryItem = createPantryItem(1L, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.of(pantryItem));

        // Act
        pantryService.deletePantryItem(1L);

        // Assert
        verify(pantryItemRepository).findById(1L);
        verify(pantryItemRepository).delete(pantryItem);
    }

    @Test
    void deletePantryItem_WhenItemNotExists_ShouldThrowException() {
        // Arrange
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pantryService.deletePantryItem(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Pantry item not found with id: 1");
    }

    @Test
    void deletePantryItem_WhenUserHasNoAccess_ShouldThrowException() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        
        PantryItem pantryItem = createPantryItem(1L, otherUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        when(pantryItemRepository.findById(1L)).thenReturn(Optional.of(pantryItem));

        // Act & Assert
        assertThatThrownBy(() -> pantryService.deletePantryItem(1L))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessage("You don't have access to this pantry item");
    }

    // Helper method
    private PantryItem createPantryItem(Long id, User user, Household household, 
                                       Ingredient ingredient, BigDecimal amount, String unit) {
        PantryItem item = new PantryItem();
        item.setId(id);
        item.setUser(user);
        item.setHousehold(household);
        item.setIngredient(ingredient);
        
        Quantity quantity = new Quantity();
        quantity.setAmount(amount);
        quantity.setUnit(unit);
        item.setQuantity(quantity);
        
        return item;
    }
}
