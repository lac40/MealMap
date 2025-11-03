package com.mealmap.model.entity;

import com.mealmap.model.embedded.GroceryItem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "grocery_trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroceryTrip {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grocery_list_id", nullable = false)
    private GroceryList groceryList;
    
    @Column(name = "trip_index", nullable = false)
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
        joinColumns = @JoinColumn(name = "grocery_trip_id")
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
