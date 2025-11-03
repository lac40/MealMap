package com.mealmap.model.dto.grocery;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ComputeGroceryRequest {
    @NotNull(message = "Plan week ID is required")
    private UUID planWeekId;
    
    @Min(value = 1, message = "Trips must be at least 1")
    @Max(value = 7, message = "Trips must be at most 7")
    private int trips = 2;
    
    private String splitRule = "Sun-Wed_Thu-Sun"; // or "custom"
    
    private List<CustomSplit> customSplits;
    
    @Data
    public static class CustomSplit {
        @NotNull
        private LocalDate from;
        
        @NotNull
        private LocalDate to;
    }
}
