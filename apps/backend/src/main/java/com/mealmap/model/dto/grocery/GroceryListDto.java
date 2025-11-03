package com.mealmap.model.dto.grocery;

import lombok.Data;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class GroceryListDto {
    private UUID id;
    private UUID planWeekId;
    private List<GroceryTripDto> trips = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
