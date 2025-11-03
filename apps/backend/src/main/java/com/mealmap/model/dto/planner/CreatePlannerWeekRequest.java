package com.mealmap.model.dto.planner;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreatePlannerWeekRequest {
    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private UUID householdId; // If null, creates personal plan

    @Valid
    private List<CreatePlannerItemRequest> items;
}
