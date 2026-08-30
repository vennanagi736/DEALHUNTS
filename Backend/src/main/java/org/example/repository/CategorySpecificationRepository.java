package org.example.repository;

import java.util.List;

import org.example.entity.CategorySpecification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategorySpecificationRepository
        extends JpaRepository<CategorySpecification, Long> {

    List<CategorySpecification> findByCategory(String category);
}