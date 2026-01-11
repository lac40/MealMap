package com.mealmap.model.dto.recipe;

import com.mealmap.model.enums.RecipeTemplateSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeTemplateDto {
    private UUID id;
    private String name;
    private String description;
    private List<String> tags;
    private List<String> dietaryTags;
    private RecipeTemplateSource source;
    private UUID ownerUserId;
    private boolean favorite;
    private boolean hidden;
    private boolean immutable;
    private List<RecipeItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;
}
