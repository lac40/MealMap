package com.mealmap.model.dto.recipe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeTemplatePageResponse {
    private List<RecipeTemplateDto> data;
    private String nextCursor;
}
