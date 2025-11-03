package com.mealmap.mapper;

import com.mealmap.model.dto.planner.PlannerItemDto;
import com.mealmap.model.dto.planner.PlannerWeekDto;
import com.mealmap.model.entity.PlannerItem;
import com.mealmap.model.entity.PlannerWeek;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PlannerMapper {

    public PlannerWeekDto toDto(PlannerWeek plannerWeek) {
        if (plannerWeek == null) {
            return null;
        }

        return PlannerWeekDto.builder()
                .id(plannerWeek.getId())
                .startDate(plannerWeek.getStartDate())
                .userId(plannerWeek.getUser() != null ? plannerWeek.getUser().getId() : null)
                .householdId(plannerWeek.getHousehold() != null ? plannerWeek.getHousehold().getId() : null)
                .items(plannerWeek.getItems().stream()
                        .map(this::toItemDto)
                        .collect(Collectors.toList()))
                .createdAt(plannerWeek.getCreatedAt())
                .updatedAt(plannerWeek.getUpdatedAt())
                .build();
    }

    public PlannerItemDto toItemDto(PlannerItem item) {
        if (item == null) {
            return null;
        }

        return PlannerItemDto.builder()
                .id(item.getId())
                .date(item.getDate())
                .slot(item.getSlot())
                .recipeId(item.getRecipe() != null ? item.getRecipe().getId() : null)
                .recipeName(item.getRecipe() != null ? item.getRecipe().getName() : null)
                .portions(item.getPortions())
                .addedByUserId(item.getAddedByUser().getId())
                .build();
    }
}
