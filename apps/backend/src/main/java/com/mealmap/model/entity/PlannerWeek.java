package com.mealmap.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "planner_weeks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlannerWeek {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDate startDate; // Monday of the week

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // If personal plan

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id")
    private Household household; // If household plan

    @OneToMany(mappedBy = "plannerWeek", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PlannerItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    // Helper method to add item
    public void addItem(PlannerItem item) {
        items.add(item);
        item.setPlannerWeek(this);
    }

    // Helper method to remove item
    public void removeItem(PlannerItem item) {
        items.remove(item);
        item.setPlannerWeek(null);
    }
}
