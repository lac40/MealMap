package com.mealmap.service;

import com.mealmap.model.dto.ingredient.CreateIngredientRequest;
import com.mealmap.model.dto.ingredient.IngredientDto;
import com.mealmap.model.dto.ingredient.IngredientPageResponse;
import com.mealmap.model.dto.ingredient.UpdateIngredientRequest;
import com.mealmap.model.entity.Category;
import com.mealmap.model.entity.Ingredient;
import com.mealmap.model.entity.User;
import com.mealmap.repository.CategoryRepository;
import com.mealmap.repository.IngredientRepository;
import com.mealmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public IngredientPageResponse getIngredients(Integer limit, String cursor, String query, UUID categoryId) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 20);
        
        Page<Ingredient> page;
        if (query != null && !query.isBlank()) {
            page = ingredientRepository.findByOwnerUserIdAndNameContainingIgnoreCase(
                currentUser.getId(), query, pageable);
        } else if (categoryId != null) {
            page = ingredientRepository.findByOwnerUserIdAndCategoryId(
                currentUser.getId(), categoryId, pageable);
        } else {
            page = ingredientRepository.findByOwnerUserId(currentUser.getId(), pageable);
        }

        List<IngredientDto> data = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        String nextCursor = page.hasNext() ? 
                Base64.getEncoder().encodeToString(String.valueOf(page.getNumber() + 1).getBytes()) : null;

        return IngredientPageResponse.builder()
                .data(data)
                .nextCursor(nextCursor)
                .build();
    }

    @Transactional(readOnly = true)
    public IngredientDto getIngredientById(UUID id) {
        User currentUser = getCurrentUser();
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found"));

        if (!ingredient.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this ingredient");
        }

        return mapToDto(ingredient);
    }

    @Transactional
    public IngredientDto createIngredient(CreateIngredientRequest request) {
        User currentUser = getCurrentUser();
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));

        Ingredient ingredient = Ingredient.builder()
                .ownerUserId(currentUser.getId())
                .name(request.getName())
                .category(category)
                .defaultUnit(request.getDefaultUnit())
                .packageSize(request.getPackageSize())
                .notes(request.getNotes())
                .build();

        ingredient = ingredientRepository.save(ingredient);
        return mapToDto(ingredient);
    }

    @Transactional
    public IngredientDto updateIngredient(UUID id, UpdateIngredientRequest request) {
        User currentUser = getCurrentUser();
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found"));

        if (!ingredient.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this ingredient");
        }

        if (request.getName() != null) {
            ingredient.setName(request.getName());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
            ingredient.setCategory(category);
        }
        if (request.getDefaultUnit() != null) {
            ingredient.setDefaultUnit(request.getDefaultUnit());
        }
        if (request.getPackageSize() != null) {
            ingredient.setPackageSize(request.getPackageSize());
        }
        if (request.getNotes() != null) {
            ingredient.setNotes(request.getNotes());
        }

        ingredient = ingredientRepository.save(ingredient);
        return mapToDto(ingredient);
    }

    @Transactional
    public void deleteIngredient(UUID id) {
        User currentUser = getCurrentUser();
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingredient not found"));

        if (!ingredient.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this ingredient");
        }

        ingredientRepository.delete(ingredient);
    }

    private IngredientDto mapToDto(Ingredient ingredient) {
        return IngredientDto.builder()
                .id(ingredient.getId())
                .ownerUserId(ingredient.getOwnerUserId())
                .name(ingredient.getName())
                .categoryId(ingredient.getCategory().getId())
                .defaultUnit(ingredient.getDefaultUnit())
                .packageSize(ingredient.getPackageSize())
                .notes(ingredient.getNotes())
                .createdAt(ingredient.getCreatedAt())
                .updatedAt(ingredient.getUpdatedAt())
                .build();
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        
        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = principal.toString();
        }
        
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
