package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    Optional<Category> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Category> findByActiveTrueOrderByNameAsc();

    List<Category> findByParentCategoryIdAndActiveTrueOrderByNameAsc(
            Long parentCategoryId
    );
}