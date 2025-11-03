package com.mealmap.repository;

import com.mealmap.model.entity.GroceryList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroceryListRepository extends JpaRepository<GroceryList, UUID> {
    
    @Query("SELECT gl FROM GroceryList gl " +
           "LEFT JOIN FETCH gl.plannerWeek pw " +
           "WHERE gl.id = :id")
    Optional<GroceryList> findByIdWithPlannerWeek(UUID id);
    
    @Query("SELECT gl FROM GroceryList gl " +
           "WHERE gl.plannerWeek.id = :planWeekId " +
           "AND (gl.user.id = :userId OR gl.household.id IN " +
           "(SELECT h.id FROM Household h JOIN h.members m WHERE m.id = :userId))")
    Optional<GroceryList> findByPlanWeekIdAndUserId(UUID planWeekId, UUID userId);
}
