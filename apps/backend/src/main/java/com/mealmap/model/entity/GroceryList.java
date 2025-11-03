package com.mealmap.model.entity;

import com.mealmap.model.embedded.GroceryTrip;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "grocery_lists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroceryList {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_week_id", nullable = false)
    private PlannerWeek plannerWeek;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id")
    private Household household;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "grocery_list_trips",
        joinColumns = @JoinColumn(name = "grocery_list_id")
    )
    @OrderColumn(name = "trip_order")
    @Builder.Default
    private List<GroceryTrip> trips = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
