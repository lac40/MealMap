package com.mealmap.service;

import com.mealmap.model.dto.recipe.*;
import com.mealmap.model.entity.Recipe;
import com.mealmap.model.entity.RecipeItem;
import com.mealmap.model.entity.User;
import com.mealmap.repository.RecipeRepository;
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
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public RecipePageResponse getRecipes(Integer limit, String cursor, String query) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 20);

        Page<Recipe> page;
        if (query != null && !query.isBlank()) {
            page = recipeRepository.findByOwnerUserIdAndNameContainingIgnoreCase(
                currentUser.getId(), query, pageable);
        } else {
            page = recipeRepository.findByOwnerUserId(currentUser.getId(), pageable);
        }

        List<RecipeDto> data = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        String nextCursor = page.hasNext() ?
                Base64.getEncoder().encodeToString(String.valueOf(page.getNumber() + 1).getBytes()) : null;

        return RecipePageResponse.builder()
                .data(data)
                .nextCursor(nextCursor)
                .build();
    }

    @Transactional(readOnly = true)
    public RecipeDto getRecipeById(UUID id) {
        User currentUser = getCurrentUser();
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));

        if (!recipe.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this recipe");
        }

        return mapToDto(recipe);
    }

    @Transactional
    public RecipeDto createRecipe(CreateRecipeRequest request) {
        User currentUser = getCurrentUser();

        Recipe recipe = Recipe.builder()
                .ownerUserId(currentUser.getId())
                .name(request.getName())
                .externalUrl(request.getExternalUrl())
                .notes(request.getNotes())
                .build();

        // Create recipe items
        Recipe finalRecipe = recipe;
        List<RecipeItem> items = request.getItems().stream()
                .map(itemDto -> RecipeItem.builder()
                        .recipe(finalRecipe)
                        .ingredientId(itemDto.getIngredientId())
                        .quantity(itemDto.getQuantity())
                        .packageNote(itemDto.getPackageNote())
                        .build())
                .toList();

        recipe.setItems(items);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return mapToDto(savedRecipe);
    }

    @Transactional
    public RecipeDto updateRecipe(UUID id, UpdateRecipeRequest request) {
        User currentUser = getCurrentUser();
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));

        if (!recipe.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this recipe");
        }

        if (request.getName() != null) {
            recipe.setName(request.getName());
        }
        if (request.getExternalUrl() != null) {
            recipe.setExternalUrl(request.getExternalUrl());
        }
        if (request.getNotes() != null) {
            recipe.setNotes(request.getNotes());
        }
        if (request.getItems() != null) {
            // Clear existing items and add new ones
            recipe.getItems().clear();
            Recipe finalRecipe = recipe;
            List<RecipeItem> newItems = request.getItems().stream()
                    .map(itemDto -> RecipeItem.builder()
                            .recipe(finalRecipe)
                            .ingredientId(itemDto.getIngredientId())
                            .quantity(itemDto.getQuantity())
                            .packageNote(itemDto.getPackageNote())
                            .build())
                    .toList();
            recipe.getItems().addAll(newItems);
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        return mapToDto(savedRecipe);
    }

    @Transactional
    public void deleteRecipe(UUID id) {
        User currentUser = getCurrentUser();
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));

        if (!recipe.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this recipe");
        }

        recipeRepository.delete(recipe);
    }

    private RecipeDto mapToDto(Recipe recipe) {
        List<RecipeItemDto> items = recipe.getItems().stream()
                .map(item -> RecipeItemDto.builder()
                        .ingredientId(item.getIngredientId())
                        .quantity(item.getQuantity())
                        .packageNote(item.getPackageNote())
                        .build())
                .toList();

        return RecipeDto.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .externalUrl(recipe.getExternalUrl())
            .notes(recipe.getNotes())
                .items(items)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
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
