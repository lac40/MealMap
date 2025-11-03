package com.mealmap.model.embedded;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroceryTrip {
    private int tripIndex;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "from", column = @Column(name = "date_range_from")),
        @AttributeOverride(name = "to", column = @Column(name = "date_range_to"))
    })
    private DateRange dateRange;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "grocery_trip_items",
        joinColumns = @JoinColumn(name = "grocery_list_id")
    )
    private List<GroceryItem> items = new ArrayList<>();
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DateRange {
        private LocalDate from;
        private LocalDate to;
    }
}
