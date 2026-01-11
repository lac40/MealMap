package com.mealmap.model.entity;

import com.mealmap.model.embedded.Quantity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "recipe_template_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeTemplateItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private RecipeTemplate template;

    @Column(nullable = false)
    private UUID ingredientId;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount", column = @Column(name = "quantity_amount")),
            @AttributeOverride(name = "unit", column = @Column(name = "quantity_unit"))
    })
    private Quantity quantity;

    @Column(length = 4000)
    private String packageNote;
}
