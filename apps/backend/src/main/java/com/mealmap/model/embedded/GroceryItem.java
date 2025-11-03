package com.mealmap.model.embedded;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroceryItem {
    private UUID ingredientId;
    private UUID categoryId;
    
    // Quantity needed from recipes
    private Quantity needed;
    
    // Quantity after subtracting pantry
    private Quantity afterPantry;
    
    private boolean checked = false;
}
