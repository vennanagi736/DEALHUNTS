package org.example.service;

import java.util.List;

import org.example.entity.Category;
import org.example.entity.TrendingCategory;
import org.example.repository.CategoryRepository;
import org.example.repository.TrendingCategoryRepository;
import org.springframework.stereotype.Service;


@Service
public class TrendingCategoryService {


    private final TrendingCategoryRepository
            trendingCategoryRepository;

    private final CategoryRepository
            categoryRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public TrendingCategoryService(
            TrendingCategoryRepository trendingCategoryRepository,
            CategoryRepository categoryRepository) {

        this.trendingCategoryRepository =
                trendingCategoryRepository;

        this.categoryRepository =
                categoryRepository;
    }


    // =====================================================
    // GET ALL TRENDING CATEGORIES
    // =====================================================

    public List<TrendingCategory> getAllTrendingCategories() {

        return trendingCategoryRepository
                .findAllByOrderByIdAsc();
    }


    // =====================================================
    // ADD TRENDING CATEGORY
    // =====================================================

    public TrendingCategory addTrendingCategory(
            Long categoryId) {


        // -------------------------------------------------
        // FIND CATEGORY
        // -------------------------------------------------

        Category category =
                categoryRepository
                        .findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found."
                                )
                        );


        // -------------------------------------------------
        // CHECK MAXIMUM 7
        // -------------------------------------------------

        long count =
                trendingCategoryRepository.count();

        if (count >= 7) {

            throw new RuntimeException(
                    "Maximum 7 trending categories are allowed."
            );
        }


        // -------------------------------------------------
        // CHECK DUPLICATE
        // -------------------------------------------------

        if (trendingCategoryRepository
                .existsByCategoryId(categoryId)) {

            throw new RuntimeException(
                    "Category is already in Trending Categories."
            );
        }


        // -------------------------------------------------
        // CREATE TRENDING CATEGORY
        // -------------------------------------------------

        TrendingCategory trendingCategory =
                new TrendingCategory(category);


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return trendingCategoryRepository
                .save(trendingCategory);
    }


    // =====================================================
    // DELETE TRENDING CATEGORY
    // =====================================================

    public void deleteTrendingCategory(Long id) {


        // -------------------------------------------------
        // CHECK EXISTENCE
        // -------------------------------------------------

        if (!trendingCategoryRepository
                .existsById(id)) {

            throw new RuntimeException(
                    "Trending category not found."
            );
        }


        // -------------------------------------------------
        // DELETE
        // -------------------------------------------------

        trendingCategoryRepository
                .deleteById(id);
    }
}