package com.mealmap.model.dto.ingredient;

import com.mealmap.model.embedded.PackageSize;
import com.mealmap.model.enums.Unit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDto {
    private UUID id;
    private UUID ownerUserId;
    private String name;
    private UUID categoryId;
    private Unit defaultUnit;
    private PackageSize packageSize;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
