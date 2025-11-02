package com.mealmap.controller;

import com.mealmap.model.dto.ingredient.CreateIngredientRequest;
import com.mealmap.model.dto.ingredient.IngredientDto;
import com.mealmap.model.dto.ingredient.IngredientPageResponse;
import com.mealmap.model.dto.ingredient.UpdateIngredientRequest;
import com.mealmap.service.IngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public ResponseEntity<IngredientPageResponse> getIngredients(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID categoryId) {
        IngredientPageResponse response = ingredientService.getIngredients(limit, cursor, q, categoryId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientDto> getIngredientById(@PathVariable UUID id) {
        IngredientDto ingredient = ingredientService.getIngredientById(id);
        return ResponseEntity.ok(ingredient);
    }

    @PostMapping
    public ResponseEntity<IngredientDto> createIngredient(@Valid @RequestBody CreateIngredientRequest request) {
        IngredientDto ingredient = ingredientService.createIngredient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ingredient);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<IngredientDto> updateIngredient(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIngredientRequest request) {
        IngredientDto ingredient = ingredientService.updateIngredient(id, request);
        return ResponseEntity.ok(ingredient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable UUID id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }
}
