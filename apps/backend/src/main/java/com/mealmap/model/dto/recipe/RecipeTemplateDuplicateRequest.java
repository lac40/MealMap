package com.mealmap.model.dto.recipe;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeTemplateDuplicateRequest {
    @Size(max = 200)
    private String name;

    @Size(max = 4000)
    private String notes;

    @Size(max = 2000)
    private String externalUrl;
}
