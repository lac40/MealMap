package com.mealmap.model.entity;

import com.mealmap.model.embedded.Quantity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "recipe_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private UUID ingredientId;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "quantity_amount")),
        @AttributeOverride(name = "unit", column = @Column(name = "quantity_unit"))
    })
    private Quantity quantity;

    @Column(columnDefinition = "TEXT")
    private String packageNote;
}
