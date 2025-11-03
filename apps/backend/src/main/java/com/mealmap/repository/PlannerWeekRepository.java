package com.mealmap.repository;

import com.mealmap.model.entity.PlannerWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlannerWeekRepository extends JpaRepository<PlannerWeek, UUID> {

    @Query("SELECT pw FROM PlannerWeek pw " +
           "WHERE (pw.user.id = :userId OR pw.household.id IN :householdIds) " +
           "AND (:from IS NULL OR pw.startDate >= :from) " +
           "AND (:to IS NULL OR pw.startDate <= :to) " +
           "ORDER BY pw.startDate DESC")
    List<PlannerWeek> findByUserOrHouseholdsAndDateRange(
            @Param("userId") UUID userId,
            @Param("householdIds") List<UUID> householdIds,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    Optional<PlannerWeek> findByStartDateAndUserId(LocalDate startDate, UUID userId);

    Optional<PlannerWeek> findByStartDateAndHouseholdId(LocalDate startDate, UUID householdId);

    @Query("SELECT pw FROM PlannerWeek pw WHERE pw.user.id = :userId")
    List<PlannerWeek> findAllByUserId(@Param("userId") UUID userId);
}
