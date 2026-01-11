package com.mealmap.model.dto.recipe;

import jakarta.validation.Valid;
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
public class UpdateRecipeRequest {
    private String name;
    private String externalUrl;

    @Size(max = 4000, message = "Notes must be 4000 characters or fewer")
    private String notes;

    @Size(max = 150, message = "Maximum 150 items allowed")
    @Valid
    private List<RecipeItemDto> items;
}
