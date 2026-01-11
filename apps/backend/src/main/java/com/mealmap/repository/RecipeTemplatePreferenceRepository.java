package com.mealmap.repository;

import com.mealmap.model.entity.RecipeTemplatePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeTemplatePreferenceRepository extends JpaRepository<RecipeTemplatePreference, UUID> {
    List<RecipeTemplatePreference> findByUserIdAndTemplateIdIn(UUID userId, List<UUID> templateIds);
    Optional<RecipeTemplatePreference> findByTemplateIdAndUserId(UUID templateId, UUID userId);
}
