package com.mealmap.model.dto.ingredient;

import com.mealmap.model.embedded.PackageSize;
import com.mealmap.model.enums.Unit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateIngredientRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Default unit is required")
    private Unit defaultUnit;

    @NotNull(message = "Package size is required")
    private PackageSize packageSize;

    private String notes;
}
