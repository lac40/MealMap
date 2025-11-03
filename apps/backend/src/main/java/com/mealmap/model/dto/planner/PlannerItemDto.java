package com.mealmap.model.dto.planner;

import com.mealmap.model.enums.MealSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerItemDto {
    private UUID id;
    private LocalDate date;
    private MealSlot slot;
    private UUID recipeId;
    private String recipeName;
    private Integer portions;
    private UUID addedByUserId;
}
