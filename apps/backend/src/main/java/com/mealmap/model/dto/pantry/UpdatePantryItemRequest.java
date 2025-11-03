package com.mealmap.model.dto.pantry;

import com.mealmap.model.embedded.Quantity;
import jakarta.validation.Valid;
import lombok.Data;

@Data
public class UpdatePantryItemRequest {
    @Valid
    private Quantity quantity;
}
