package com.mealmap.controller;

import com.mealmap.model.dto.pantry.CreatePantryItemRequest;
import com.mealmap.model.dto.pantry.PantryItemDto;
import com.mealmap.model.dto.pantry.PantryItemPageResponse;
import com.mealmap.model.dto.pantry.UpdatePantryItemRequest;
import com.mealmap.service.PantryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/pantry")
@RequiredArgsConstructor
public class PantryController {

    private final PantryService pantryService;

    @GetMapping
    public ResponseEntity<PantryItemPageResponse> getPantryItems(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String cursor) {
        PantryItemPageResponse response = pantryService.getPantryItems(limit, cursor);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PantryItemDto> getPantryItemById(@PathVariable UUID id) {
        PantryItemDto pantryItem = pantryService.getPantryItemById(id);
        return ResponseEntity.ok(pantryItem);
    }

    @PostMapping
    public ResponseEntity<PantryItemDto> createPantryItem(@Valid @RequestBody CreatePantryItemRequest request) {
        PantryItemDto pantryItem = pantryService.createPantryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pantryItem);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PantryItemDto> updatePantryItem(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePantryItemRequest request) {
        PantryItemDto pantryItem = pantryService.updatePantryItem(id, request);
        return ResponseEntity.ok(pantryItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePantryItem(@PathVariable UUID id) {
        pantryService.deletePantryItem(id);
        return ResponseEntity.noContent().build();
    }
}
