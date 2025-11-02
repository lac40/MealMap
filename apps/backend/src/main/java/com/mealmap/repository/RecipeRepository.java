package com.mealmap.repository;

import com.mealmap.model.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {
    Page<Recipe> findByOwnerUserId(UUID ownerUserId, Pageable pageable);
    Page<Recipe> findByOwnerUserIdAndNameContainingIgnoreCase(UUID ownerUserId, String name, Pageable pageable);
}
