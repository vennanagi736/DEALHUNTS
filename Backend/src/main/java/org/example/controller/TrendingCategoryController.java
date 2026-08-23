package org.example.controller;

import java.util.List;

import org.example.entity.TrendingCategory;
import org.example.service.TrendingCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/admin/trending-categories")
@CrossOrigin(origins = "http://localhost:5173")
public class TrendingCategoryController {


    private final TrendingCategoryService
            trendingCategoryService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public TrendingCategoryController(
            TrendingCategoryService trendingCategoryService) {

        this.trendingCategoryService =
                trendingCategoryService;
    }


    // =====================================================
    // GET ALL TRENDING CATEGORIES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<TrendingCategory>>
            getAllTrendingCategories() {

        return ResponseEntity.ok(
                trendingCategoryService
                        .getAllTrendingCategories()
        );
    }


    // =====================================================
    // ADD TRENDING CATEGORY
    // =====================================================

    @PostMapping("/{categoryId}")
    public ResponseEntity<TrendingCategory>
            addTrendingCategory(
                    @PathVariable Long categoryId) {

        TrendingCategory trendingCategory =
                trendingCategoryService
                        .addTrendingCategory(categoryId);

        return ResponseEntity.ok(
                trendingCategory
        );
    }


    // =====================================================
    // DELETE TRENDING CATEGORY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
            deleteTrendingCategory(
                    @PathVariable Long id) {

        trendingCategoryService
                .deleteTrendingCategory(id);

        return ResponseEntity.ok(
                "Trending category removed successfully."
        );
    }
}