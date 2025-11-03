package com.mealmap.controller;

import com.mealmap.model.dto.grocery.ComputeGroceryRequest;
import com.mealmap.model.dto.grocery.GroceryListDto;
import com.mealmap.model.dto.grocery.UpdateGroceryListRequest;
import com.mealmap.service.GroceryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/grocery")
@RequiredArgsConstructor
public class GroceryController {
    
    private final GroceryService groceryService;
    
    @PostMapping("/compute")
    public ResponseEntity<GroceryListDto> computeGroceryList(
            @Valid @RequestBody ComputeGroceryRequest request) {
        GroceryListDto groceryList = groceryService.computeGroceryList(request);
        return ResponseEntity.ok(groceryList);
    }
    
    @PatchMapping("/lists/{id}")
    public ResponseEntity<GroceryListDto> updateGroceryList(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateGroceryListRequest request) {
        GroceryListDto updated = groceryService.updateGroceryList(id, request);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/lists/{id}")
    public ResponseEntity<GroceryListDto> getGroceryListById(@PathVariable UUID id) {
        GroceryListDto groceryList = groceryService.getGroceryListById(id);
        return ResponseEntity.ok(groceryList);
    }
}
