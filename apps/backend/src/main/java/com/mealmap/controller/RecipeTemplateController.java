package com.mealmap.controller;

import com.mealmap.model.dto.recipe.CreateRecipeTemplateRequest;
import com.mealmap.model.dto.recipe.RecipeDto;
import com.mealmap.model.dto.recipe.RecipeTemplateDto;
import com.mealmap.model.dto.recipe.RecipeTemplateDuplicateRequest;
import com.mealmap.model.dto.recipe.RecipeTemplatePageResponse;
import com.mealmap.model.dto.recipe.RecipeTemplatePreferencesRequest;
import com.mealmap.model.dto.recipe.UpdateRecipeTemplateRequest;
import com.mealmap.service.RecipeTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class RecipeTemplateController {

    private final RecipeTemplateService recipeTemplateService;

    @GetMapping
    public ResponseEntity<RecipeTemplatePageResponse> getTemplates(
            @RequestParam(name = "limit", required = false) Integer limit,
            @RequestParam(name = "cursor", required = false) String cursor,
            @RequestParam(name = "q", required = false) String query) {
        RecipeTemplatePageResponse response = recipeTemplateService.getTemplates(limit, cursor, query);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeTemplateDto> getTemplate(@PathVariable UUID id) {
        RecipeTemplateDto template = recipeTemplateService.getTemplate(id);
        return ResponseEntity.ok(template);
    }

    @PostMapping
    public ResponseEntity<RecipeTemplateDto> createTemplate(
            @Valid @RequestBody CreateRecipeTemplateRequest request) {
        RecipeTemplateDto template = recipeTemplateService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RecipeTemplateDto> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRecipeTemplateRequest request) {
        RecipeTemplateDto template = recipeTemplateService.updateTemplate(id, request);
        return ResponseEntity.ok(template);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        recipeTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/preferences")
    public ResponseEntity<RecipeTemplateDto> updatePreferences(
            @PathVariable UUID id,
            @Valid @RequestBody RecipeTemplatePreferencesRequest request) {
        RecipeTemplateDto template = recipeTemplateService.updatePreferences(id, request);
        return ResponseEntity.ok(template);
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<RecipeDto> duplicateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody RecipeTemplateDuplicateRequest request) {
        RecipeDto recipe = recipeTemplateService.duplicateTemplate(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(recipe);
    }
}
