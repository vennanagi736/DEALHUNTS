package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.AttributeDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttributeDefinitionRepository
        extends JpaRepository<AttributeDefinition, Long> {

    // ============================================================
    // CATEGORY ATTRIBUTES
    // ============================================================

    List<AttributeDefinition> findByCategoryId(
            Long categoryId
    );

    // Active attributes for a category
    List<AttributeDefinition>
    findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(
            Long categoryId
    );

    // All attributes for a category ordered by display order
    List<AttributeDefinition>
    findByCategoryIdOrderByDisplayOrderAsc(
            Long categoryId
    );

    // ============================================================
    // FIND ATTRIBUTE BY CATEGORY + NAME
    // ============================================================

    Optional<AttributeDefinition>
    findByCategoryIdAndName(
            Long categoryId,
            String name
    );

    // Case-insensitive version
    Optional<AttributeDefinition>
    findByCategoryIdAndNameIgnoreCase(
            Long categoryId,
            String name
    );
}
