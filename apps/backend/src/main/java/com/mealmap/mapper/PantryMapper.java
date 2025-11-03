package com.mealmap.mapper;

import com.mealmap.model.dto.pantry.PantryItemDto;
import com.mealmap.model.entity.PantryItem;
import org.springframework.stereotype.Component;

@Component
public class PantryMapper {

    public PantryItemDto toDto(PantryItem pantryItem) {
        if (pantryItem == null) {
            return null;
        }

        return PantryItemDto.builder()
                .id(pantryItem.getId())
                .ingredientId(pantryItem.getIngredient().getId())
                .ingredientName(pantryItem.getIngredient().getName())
                .categoryId(pantryItem.getIngredient().getCategory().getId())
                .categoryName(pantryItem.getIngredient().getCategory().getName())
                .quantity(pantryItem.getQuantity())
                .userId(pantryItem.getUser() != null ? pantryItem.getUser().getId() : null)
                .householdId(pantryItem.getHousehold() != null ? pantryItem.getHousehold().getId() : null)
                .createdAt(pantryItem.getCreatedAt())
                .updatedAt(pantryItem.getUpdatedAt())
                .build();
    }
}
