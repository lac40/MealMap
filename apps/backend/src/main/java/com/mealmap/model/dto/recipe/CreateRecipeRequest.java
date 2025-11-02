package com.mealmap.model.dto.recipe;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRecipeRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String externalUrl;

    @NotNull(message = "Items are required")
    @Size(max = 150, message = "Maximum 150 items allowed")
    @Valid
    private List<RecipeItemDto> items;
}
