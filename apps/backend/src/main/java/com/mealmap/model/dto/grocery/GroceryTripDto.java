package com.mealmap.model.dto.grocery;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class GroceryTripDto {
    private int tripIndex;
    private DateRangeDto dateRange;
    private List<GroceryItemDto> items = new ArrayList<>();
    
    @Data
    public static class DateRangeDto {
        private LocalDate from;
        private LocalDate to;
    }
}
