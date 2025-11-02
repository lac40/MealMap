package com.mealmap.model.dto.recipe;

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
public class RecipeDto {
    private UUID id;
    private String name;
    private String externalUrl;
    private List<RecipeItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;
}
