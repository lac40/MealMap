package com.mealmap.model.dto.pantry;

import com.mealmap.model.embedded.Quantity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PantryItemDto {
    private UUID id;
    private UUID ingredientId;
    private String ingredientName;
    private UUID categoryId;
    private String categoryName;
    private Quantity quantity;
    private UUID userId;
    private UUID householdId;
    private Instant createdAt;
    private Instant updatedAt;
}
