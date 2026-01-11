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
public class CreateRecipeTemplateRequest {

    @NotBlank
    @Size(max = 200, message = "Name must be at most 200 characters")
    private String name;

    @Size(max = 2000)
    private String description;

    @Size(max = 50)
    private List<@Size(max = 60) String> tags;

    @Size(max = 50)
    private List<@Size(max = 60) String> dietaryTags;

    @NotNull
    @Size(min = 1, max = 150)
    @Valid
    private List<RecipeItemDto> items;
}
