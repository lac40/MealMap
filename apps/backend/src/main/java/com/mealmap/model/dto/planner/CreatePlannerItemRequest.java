package com.mealmap.model.dto.planner;

import com.mealmap.model.enums.MealSlot;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreatePlannerItemRequest {
    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Meal slot is required")
    private MealSlot slot;

    private UUID recipeId;

    @NotNull(message = "Portions is required")
    @Min(value = 1, message = "Portions must be at least 1")
    private Integer portions;
}
