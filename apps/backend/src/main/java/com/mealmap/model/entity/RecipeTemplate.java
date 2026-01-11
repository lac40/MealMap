package com.mealmap.model.entity;

import com.mealmap.model.enums.RecipeTemplateSource;
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
@Table(name = "recipe_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(name = "tags", columnDefinition = "NVARCHAR(MAX)")
    private String tags;

    @Column(name = "dietary_tags", columnDefinition = "NVARCHAR(MAX)")
    private String dietaryTags;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipeTemplateSource source;

    private UUID ownerUserId;

    @Column(nullable = false)
    private boolean immutable;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RecipeTemplateItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
