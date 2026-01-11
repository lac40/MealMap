package com.mealmap.repository;

import com.mealmap.model.entity.RecipeTemplate;
import com.mealmap.model.enums.RecipeTemplateSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeTemplateRepository extends JpaRepository<RecipeTemplate, UUID> {

    @EntityGraph(attributePaths = "items")
    @Query("SELECT t FROM RecipeTemplate t WHERE (t.source = :globalSource OR t.ownerUserId = :ownerUserId)")
    Page<RecipeTemplate> findVisibleTemplates(@Param("ownerUserId") UUID ownerUserId,
                                              @Param("globalSource") RecipeTemplateSource globalSource,
                                              Pageable pageable);

    @EntityGraph(attributePaths = "items")
    @Query("SELECT t FROM RecipeTemplate t WHERE (t.source = :globalSource OR t.ownerUserId = :ownerUserId) " +
            "AND LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<RecipeTemplate> findVisibleTemplatesByName(@Param("ownerUserId") UUID ownerUserId,
                                                    @Param("globalSource") RecipeTemplateSource globalSource,
                                                    @Param("name") String name,
                                                    Pageable pageable);

    @EntityGraph(attributePaths = "items")
    Optional<RecipeTemplate> findWithItemsById(UUID id);
}
