package com.mealmap.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long ingredientsCount;
    private long recipesCount;
    private long plannedMealsCount;
    private long pantryItemsCount;
    private long upcomingMealsCount; // Next 7 days
}
