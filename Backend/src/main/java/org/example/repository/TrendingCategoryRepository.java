package org.example.repository;

import java.util.List;

import org.example.entity.TrendingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrendingCategoryRepository
        extends JpaRepository<TrendingCategory, Long> {

    boolean existsByCategoryId(Long categoryId);

    List<TrendingCategory> findAllByOrderByIdAsc();
}