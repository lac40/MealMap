package com.mealmap.model.dto.planner;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePlannerWeekRequest {
    @Valid
    private List<CreatePlannerItemRequest> items;
}
