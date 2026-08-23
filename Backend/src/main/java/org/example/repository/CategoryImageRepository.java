package org.example.repository;

import java.util.Optional;

import org.example.entity.Category;
import org.example.entity.CategoryImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryImageRepository
        extends JpaRepository<CategoryImage, Long> {

    Optional<CategoryImage> findByCategory(Category category);

    void deleteByCategory(Category category);
}