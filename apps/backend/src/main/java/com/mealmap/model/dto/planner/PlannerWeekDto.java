package com.mealmap.model.dto.planner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerWeekDto {
    private UUID id;
    private LocalDate startDate;
    private UUID userId;
    private UUID householdId;
    private List<PlannerItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;
}
