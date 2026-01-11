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
public class UpdateRecipeTemplateRequest {
    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    @Size(max = 50)
    private List<@Size(max = 60) String> tags;

    @Size(max = 50)
    private List<@Size(max = 60) String> dietaryTags;

    @Size(max = 150)
    @Valid
    private List<RecipeItemDto> items;
}
