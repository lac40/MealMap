package com.mealmap.repository;

import com.mealmap.model.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {
    Page<Ingredient> findByOwnerUserId(UUID ownerUserId, Pageable pageable);
    Page<Ingredient> findByOwnerUserIdAndNameContainingIgnoreCase(UUID ownerUserId, String name, Pageable pageable);
    Page<Ingredient> findByOwnerUserIdAndCategoryId(UUID ownerUserId, UUID categoryId, Pageable pageable);
    Page<Ingredient> findByOwnerUserIdIn(List<UUID> ownerUserIds, Pageable pageable);
    Page<Ingredient> findByOwnerUserIdInAndNameContainingIgnoreCase(List<UUID> ownerUserIds, String name, Pageable pageable);
    Page<Ingredient> findByOwnerUserIdInAndCategoryId(List<UUID> ownerUserIds, UUID categoryId, Pageable pageable);
    
    long countByOwnerUserId(UUID ownerUserId);
}
