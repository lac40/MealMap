package com.mealmap.model.dto.pantry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PantryItemPageResponse {
    private List<PantryItemDto> data;
    private String nextCursor;
}
