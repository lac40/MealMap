package com.mealmap.model.dto.grocery;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UpdateGroceryListRequest {
    @NotNull
    @Valid
    private List<TripUpdate> trips;
    
    @Data
    public static class TripUpdate {
        @NotNull
        private Integer tripIndex;
        
        @NotNull
        @Valid
        private List<GroceryItemDto> items;
    }
}
