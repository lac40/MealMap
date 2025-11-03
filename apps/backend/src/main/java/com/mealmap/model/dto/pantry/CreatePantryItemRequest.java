package com.mealmap.model.dto.pantry;

import com.mealmap.model.embedded.Quantity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePantryItemRequest {
    @NotNull(message = "Ingredient ID is required")
    private UUID ingredientId;

    @NotNull(message = "Quantity is required")
    @Valid
    private Quantity quantity;

    private UUID householdId; // If null, creates personal pantry item
}
