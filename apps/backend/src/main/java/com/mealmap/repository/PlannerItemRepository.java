package com.mealmap.repository;

import com.mealmap.model.entity.PlannerItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PlannerItemRepository extends JpaRepository<PlannerItem, UUID> {
}
