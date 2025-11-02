package com.mealmap.controller;

import com.mealmap.model.dto.recipe.CreateRecipeRequest;
import com.mealmap.model.dto.recipe.RecipeDto;
import com.mealmap.model.dto.recipe.RecipePageResponse;
import com.mealmap.model.dto.recipe.UpdateRecipeRequest;
import com.mealmap.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<RecipePageResponse> getRecipes(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) String q) {
        RecipePageResponse response = recipeService.getRecipes(limit, cursor, q);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDto> getRecipeById(@PathVariable UUID id) {
        RecipeDto recipe = recipeService.getRecipeById(id);
        return ResponseEntity.ok(recipe);
    }

    @PostMapping
    public ResponseEntity<RecipeDto> createRecipe(@Valid @RequestBody CreateRecipeRequest request) {
        RecipeDto recipe = recipeService.createRecipe(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(recipe);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RecipeDto> updateRecipe(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRecipeRequest request) {
        RecipeDto recipe = recipeService.updateRecipe(id, request);
        return ResponseEntity.ok(recipe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable UUID id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
