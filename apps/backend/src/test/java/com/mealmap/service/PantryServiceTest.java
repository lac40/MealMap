package com.mealmap.service;

import com.mealmap.exception.ResourceNotFoundException;
import com.mealmap.exception.UnauthorizedException;
import com.mealmap.mapper.PantryMapper;
import com.mealmap.model.dto.pantry.*;
import com.mealmap.model.entity.*;
import com.mealmap.repository.*;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

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
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");

        testHousehold = new Household();
        testHousehold.setId(UUID.randomUUID());
        testHousehold.setName("Test Household");
        testHousehold.getMembers().add(testUser);

        testCategory = new Category();
        testCategory.setId(UUID.randomUUID());
        testCategory.setName("Dairy");

        testIngredient = new Ingredient();
        testIngredient.setId(UUID.randomUUID());
        testIngredient.setName("Milk");
        testIngredient.setCategory(testCategory);

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("test@example.com");
        SecurityContextHolder.setContext(securityContext);
        lenient().when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    }

    @Test
    void getPantryItems_ShouldReturnUserAndHouseholdItems() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        
        PantryItem userItem = createPantryItem(UUID.randomUUID(), testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItem householdItem = createPantryItem(UUID.randomUUID(), null, testHousehold, testIngredient, new BigDecimal("1"), "l");
        
        List<PantryItem> items = Arrays.asList(userItem, householdItem);
        Page<PantryItem> page = new PageImpl<>(items, pageable, items.size());
        
        when(pantryItemRepository.findByUserIdOrUserHouseholdId(eq(testUser.getId()), eq(testUser.getId()), any(Pageable.class)))
            .thenReturn(page);
        
        PantryItemDto userItemDto = new PantryItemDto();
        userItemDto.setId(userItem.getId());
        PantryItemDto householdItemDto = new PantryItemDto();
        householdItemDto.setId(householdItem.getId());
        
        when(pantryMapper.toDto(userItem)).thenReturn(userItemDto);
        when(pantryMapper.toDto(householdItem)).thenReturn(householdItemDto);

        // Act
        PantryItemPageResponse response = pantryService.getPantryItems(pageable);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getItems()).hasSize(2);
        assertThat(response.getTotalElements()).isEqualTo(2);
        assertThat(response.getTotalPages()).isEqualTo(1);
        verify(pantryItemRepository).findByUserIdOrUserHouseholdId(eq(testUser.getId()), eq(testUser.getId()), any(Pageable.class));
    }

    @Test
    void getPantryItemById_WhenItemExists_ShouldReturnItem() {
        // Arrange
        UUID itemId = UUID.randomUUID();
        PantryItem pantryItem = createPantryItem(itemId, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItemDto dto = new PantryItemDto();
        dto.setId(itemId);
        
        when(pantryItemRepository.findById(itemId)).thenReturn(Optional.of(pantryItem));
        when(pantryMapper.toDto(pantryItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.getPantryItemById(itemId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(itemId);
        verify(pantryItemRepository).findById(itemId);
    }

    @Test
    void getPantryItemById_WhenItemNotExists_ShouldThrowException() {
        // Arrange
        UUID itemId = UUID.randomUUID();
        when(pantryItemRepository.findById(itemId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pantryService.getPantryItemById(itemId))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Pantry item not found");
    }

    @Test
    void getPantryItemById_WhenUserHasNoAccess_ShouldThrowException() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");
        
        UUID itemId = UUID.randomUUID();
        PantryItem pantryItem = createPantryItem(itemId, otherUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        when(pantryItemRepository.findById(itemId)).thenReturn(Optional.of(pantryItem));

        // Act & Assert
        assertThatThrownBy(() -> pantryService.getPantryItemById(itemId))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("don't have access");
    }

    @Test
    void createPantryItem_WithUserOwnership_ShouldCreateItem() {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(testIngredient.getId());
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        UUID itemId = UUID.randomUUID();
        PantryItem pantryItem = createPantryItem(null, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItem savedItem = createPantryItem(itemId, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        PantryItemDto dto = new PantryItemDto();
        dto.setId(itemId);
        
        when(ingredientRepository.findById(testIngredient.getId())).thenReturn(Optional.of(testIngredient));
        when(pantryMapper.toEntity(request)).thenReturn(pantryItem);
        when(pantryItemRepository.save(pantryItem)).thenReturn(savedItem);
        when(pantryMapper.toDto(savedItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.createPantryItem(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(itemId);
        verify(ingredientRepository).findById(testIngredient.getId());
        verify(pantryItemRepository).save(pantryItem);
        assertThat(pantryItem.getUser()).isEqualTo(testUser);
        assertThat(pantryItem.getIngredient()).isEqualTo(testIngredient);
    }

    @Test
    void createPantryItem_WithHouseholdOwnership_ShouldCreateItem() {
        // Arrange
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(testIngredient.getId());
        request.setHouseholdId(testHousehold.getId());
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        UUID itemId = UUID.randomUUID();
        PantryItem pantryItem = createPantryItem(null, null, testHousehold, testIngredient, new BigDecimal("500"), "ml");
        PantryItem savedItem = createPantryItem(itemId, null, testHousehold, testIngredient, new BigDecimal("500"), "ml");
        
        PantryItemDto dto = new PantryItemDto();
        dto.setId(itemId);
        
        when(ingredientRepository.findById(testIngredient.getId())).thenReturn(Optional.of(testIngredient));
        when(pantryMapper.toEntity(request)).thenReturn(pantryItem);
        when(pantryItemRepository.save(pantryItem)).thenReturn(savedItem);
        when(pantryMapper.toDto(savedItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.createPantryItem(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(itemId);
        verify(pantryItemRepository).save(pantryItem);
        assertThat(pantryItem.getHousehold()).isEqualTo(testHousehold);
    }

    @Test
    void createPantryItem_WhenIngredientNotExists_ShouldThrowException() {
        // Arrange
        UUID ingredientId = UUID.randomUUID();
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(ingredientId);
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        when(ingredientRepository.findById(ingredientId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pantryService.createPantryItem(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Ingredient not found");
    }

    @Test
    void createPantryItem_WhenHouseholdNotAccessible_ShouldThrowException() {
        // Arrange
        Household otherHousehold = new Household();
        otherHousehold.setId(UUID.randomUUID());
        otherHousehold.setName("Other Household");
        
        CreatePantryItemRequest request = new CreatePantryItemRequest();
        request.setIngredientId(testIngredient.getId());
        request.setHouseholdId(otherHousehold.getId());
        request.setQuantityAmount(new BigDecimal("500"));
        request.setQuantityUnit("ml");
        
        PantryItem pantryItem = createPantryItem(null, null, otherHousehold, testIngredient, new BigDecimal("500"), "ml");
        
        when(ingredientRepository.findById(testIngredient.getId())).thenReturn(Optional.of(testIngredient));
        when(pantryMapper.toEntity(request)).thenReturn(pantryItem);

        // Act & Assert
        assertThatThrownBy(() -> pantryService.createPantryItem(request))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("don't have access");
    }

    @Test
    void updatePantryItem_ShouldUpdateItem() {
        // Arrange
        UUID itemId = UUID.randomUUID();
        UpdatePantryItemRequest request = new UpdatePantryItemRequest();
        request.setQuantityAmount(new BigDecimal("1000"));
        request.setQuantityUnit("ml");
        
        PantryItem pantryItem = createPantryItem(itemId, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        PantryItem updatedItem = createPantryItem(itemId, testUser, null, testIngredient, new BigDecimal("1000"), "ml");
        
        PantryItemDto dto = new PantryItemDto();
        dto.setId(itemId);
        
        when(pantryItemRepository.findById(itemId)).thenReturn(Optional.of(pantryItem));
        when(pantryItemRepository.save(pantryItem)).thenReturn(updatedItem);
        when(pantryMapper.toDto(updatedItem)).thenReturn(dto);

        // Act
        PantryItemDto result = pantryService.updatePantryItem(itemId, request);

        // Assert
        assertThat(result).isNotNull();
        verify(pantryItemRepository).findById(itemId);
        verify(pantryMapper).updateEntityFromDto(request, pantryItem);
        verify(pantryItemRepository).save(pantryItem);
    }

    @Test
    void deletePantryItem_ShouldDeleteItem() {
        // Arrange
        UUID itemId = UUID.randomUUID();
        PantryItem pantryItem = createPantryItem(itemId, testUser, null, testIngredient, new BigDecimal("500"), "ml");
        
        when(pantryItemRepository.findById(itemId)).thenReturn(Optional.of(pantryItem));

        // Act
        pantryService.deletePantryItem(itemId);

        // Assert
        verify(pantryItemRepository).findById(itemId);
        verify(pantryItemRepository).delete(pantryItem);
    }

    // Helper method
    private PantryItem createPantryItem(UUID id, User user, Household household, 
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
