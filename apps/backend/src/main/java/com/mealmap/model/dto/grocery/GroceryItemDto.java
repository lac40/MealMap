package com.mealmap.model.dto.grocery;

import com.mealmap.model.embedded.Quantity;
import lombok.Data;

import java.util.UUID;

@Data
public class GroceryItemDto {
    private UUID ingredientId;
    private String ingredientName;
    private UUID categoryId;
    private String categoryName;
    private Quantity needed;
    private Quantity afterPantry;
    private boolean checked;
}
