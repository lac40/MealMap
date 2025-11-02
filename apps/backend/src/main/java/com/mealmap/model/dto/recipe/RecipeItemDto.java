package com.mealmap.model.dto.recipe;

import com.mealmap.model.embedded.Quantity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeItemDto {
    private UUID ingredientId;
    private Quantity quantity;
    private String packageNote;
}
