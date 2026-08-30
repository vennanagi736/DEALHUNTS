package org.example.service;

import java.util.List;

import org.example.dto.AttributeDefinitionDTO;
import org.example.entity.AttributeDefinition;
import org.example.repository.AttributeDefinitionRepository;
import org.springframework.stereotype.Service;

@Service
public class AttributeDefinitionService {

    private final AttributeDefinitionRepository repository;

    public AttributeDefinitionService(
            AttributeDefinitionRepository repository) {

        this.repository = repository;
    }

    // ============================================================
    // GET ACTIVE ATTRIBUTES BY CATEGORY
    // ============================================================

    public List<AttributeDefinitionDTO> getActiveAttributesByCategory(
            Long categoryId) {

        if (categoryId == null) {
            throw new RuntimeException("Category ID is required");
        }

        return repository
                .findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(
                        categoryId
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // ============================================================
    // GET ALL ATTRIBUTES BY CATEGORY
    // ============================================================

    public List<AttributeDefinitionDTO> getAllAttributesByCategory(
            Long categoryId) {

        if (categoryId == null) {
            throw new RuntimeException("Category ID is required");
        }

        return repository
                .findByCategoryIdOrderByDisplayOrderAsc(categoryId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // ============================================================
    // ENTITY → DTO
    // ============================================================

    private AttributeDefinitionDTO convertToDTO(
            AttributeDefinition attribute) {

        AttributeDefinitionDTO dto =
                new AttributeDefinitionDTO();

        dto.setId(attribute.getId());

        dto.setCategoryId(
                attribute.getCategory() != null
                        ? attribute.getCategory().getId()
                        : null
        );

        dto.setName(attribute.getName());
        dto.setLabel(attribute.getLabel());
        dto.setPlaceholder(attribute.getPlaceholder());
        dto.setDataType(attribute.getDataType());
        dto.setUnit(attribute.getUnit());
        dto.setRequired(attribute.isRequired());
        dto.setComparable(attribute.isComparable());
        dto.setDisplayOrder(attribute.getDisplayOrder());
        dto.setActive(attribute.isActive());

        return dto;
    }
}