package com.mealmap.service;

import com.mealmap.exception.ResourceNotFoundException;
import com.mealmap.exception.UnauthorizedException;
import com.mealmap.mapper.PantryMapper;
import com.mealmap.model.dto.pantry.CreatePantryItemRequest;
import com.mealmap.model.dto.pantry.PantryItemDto;
import com.mealmap.model.dto.pantry.PantryItemPageResponse;
import com.mealmap.model.dto.pantry.UpdatePantryItemRequest;
import com.mealmap.model.entity.Ingredient;
import com.mealmap.model.entity.PantryItem;
import com.mealmap.model.entity.User;
import com.mealmap.repository.IngredientRepository;
import com.mealmap.repository.PantryItemRepository;
import com.mealmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PantryService {

    private final PantryItemRepository pantryItemRepository;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
    private final PantryMapper pantryMapper;

    @Transactional(readOnly = true)
    public PantryItemPageResponse getPantryItems(Integer limit, String cursor) {
        User currentUser = getCurrentUser();

        // Get user's households
        List<UUID> householdIds = new ArrayList<>();
        if (currentUser.getHousehold() != null) {
            householdIds.add(currentUser.getHousehold().getId());
        }

        // Use appropriate query based on whether user has households
        List<PantryItem> items;
        if (householdIds.isEmpty()) {
            items = pantryItemRepository.findByUserId(currentUser.getId());
        } else {
            items = pantryItemRepository.findByUserOrHouseholds(
                    currentUser.getId(),
                    householdIds
            );
        }

        // Apply limit if provided
        if (limit != null && limit > 0 && items.size() > limit) {
            items = items.subList(0, limit);
        }

        List<PantryItemDto> dtos = items.stream()
                .map(pantryMapper::toDto)
                .toList();

        return PantryItemPageResponse.builder()
                .data(dtos)
                .nextCursor(null) // Simple implementation without cursor pagination
                .build();
    }

    @Transactional(readOnly = true)
    public PantryItemDto getPantryItemById(UUID id) {
        PantryItem pantryItem = pantryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pantry item not found with id: " + id));

        // Check access permissions
        User currentUser = getCurrentUser();
        if (!hasAccessToPantryItem(pantryItem, currentUser)) {
            throw new UnauthorizedException("You don't have access to this pantry item");
        }

        return pantryMapper.toDto(pantryItem);
    }

    @Transactional
    public PantryItemDto createPantryItem(CreatePantryItemRequest request) {
        User currentUser = getCurrentUser();

        // Verify ingredient exists
        Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found with id: " + request.getIngredientId()));

        PantryItem pantryItem = PantryItem.builder()
                .ingredient(ingredient)
                .quantity(request.getQuantity())
                .build();

        // Set user or household
        if (request.getHouseholdId() != null) {
            // Verify user has access to household
            if (currentUser.getHousehold() == null ||
                !currentUser.getHousehold().getId().equals(request.getHouseholdId())) {
                throw new UnauthorizedException("You don't have access to this household");
            }
            pantryItem.setHousehold(currentUser.getHousehold());
        } else {
            pantryItem.setUser(currentUser);
        }

        PantryItem savedItem = pantryItemRepository.save(pantryItem);
        log.info("Created pantry item with id: {}", savedItem.getId());

        return pantryMapper.toDto(savedItem);
    }

    @Transactional
    public PantryItemDto updatePantryItem(UUID id, UpdatePantryItemRequest request) {
        PantryItem pantryItem = pantryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pantry item not found with id: " + id));

        User currentUser = getCurrentUser();
        if (!hasAccessToPantryItem(pantryItem, currentUser)) {
            throw new UnauthorizedException("You don't have access to this pantry item");
        }

        // Update quantity if provided
        if (request.getQuantity() != null) {
            pantryItem.setQuantity(request.getQuantity());
        }

        PantryItem updatedItem = pantryItemRepository.save(pantryItem);
        log.info("Updated pantry item with id: {}", updatedItem.getId());

        return pantryMapper.toDto(updatedItem);
    }

    @Transactional
    public void deletePantryItem(UUID id) {
        PantryItem pantryItem = pantryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pantry item not found with id: " + id));

        User currentUser = getCurrentUser();
        if (!hasAccessToPantryItem(pantryItem, currentUser)) {
            throw new UnauthorizedException("You don't have access to this pantry item");
        }

        pantryItemRepository.delete(pantryItem);
        log.info("Deleted pantry item with id: {}", id);
    }

    private boolean hasAccessToPantryItem(PantryItem pantryItem, User user) {
        // User owns it
        if (pantryItem.getUser() != null && pantryItem.getUser().getId().equals(user.getId())) {
            return true;
        }

        // User is in the household
        if (pantryItem.getHousehold() != null && user.getHousehold() != null) {
            return pantryItem.getHousehold().getId().equals(user.getHousehold().getId());
        }

        return false;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
