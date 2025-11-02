package com.mealmap.model.dto.ingredient;

import com.mealmap.model.embedded.PackageSize;
import com.mealmap.model.enums.Unit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateIngredientRequest {
    private String name;
    private UUID categoryId;
    private Unit defaultUnit;
    private PackageSize packageSize;
    private String notes;
}
