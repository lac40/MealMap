package com.mealmap.repository;

import com.mealmap.model.entity.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PantryItemRepository extends JpaRepository<PantryItem, UUID> {

    @Query("SELECT p FROM PantryItem p " +
           "WHERE p.user.id = :userId OR p.household.id IN :householdIds " +
           "ORDER BY p.createdAt DESC")
    List<PantryItem> findByUserOrHouseholds(
            @Param("userId") UUID userId,
            @Param("householdIds") List<UUID> householdIds
    );

    @Query("SELECT p FROM PantryItem p WHERE p.user.id = :userId")
    List<PantryItem> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT p FROM PantryItem p WHERE p.household.id = :householdId")
    List<PantryItem> findByHouseholdId(@Param("householdId") UUID householdId);
}
