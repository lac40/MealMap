package com.mealmap.model.entity;

import com.mealmap.model.enums.UserRole;
import com.mealmap.model.enums.MealSlot;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @ElementCollection
    @CollectionTable(name = "profile_meal_slots", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "meal_slot")
    @Enumerated(EnumType.STRING)
    private List<MealSlot> mealSlots;
}
