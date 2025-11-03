package com.mealmap.model.embedded;

import jakarta.persistence.*;
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
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "needed_amount")),
        @AttributeOverride(name = "unit", column = @Column(name = "needed_unit"))
    })
    private Quantity needed;
    
    // Quantity after subtracting pantry
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "after_pantry_amount")),
        @AttributeOverride(name = "unit", column = @Column(name = "after_pantry_unit"))
    })
    private Quantity afterPantry;
    
    private boolean checked = false;
}
