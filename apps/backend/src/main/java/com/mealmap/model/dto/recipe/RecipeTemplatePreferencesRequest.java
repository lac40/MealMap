package com.mealmap.model.dto.recipe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeTemplatePreferencesRequest {
    private Boolean favorite;
    private Boolean hidden;
}
