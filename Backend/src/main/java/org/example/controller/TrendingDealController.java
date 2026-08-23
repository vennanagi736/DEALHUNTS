package org.example.controller;

import java.util.List;

import org.example.entity.TrendingDeal;
import org.example.service.TrendingDealService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/trending-deals")
@CrossOrigin(origins = "http://localhost:5173")
public class TrendingDealController {

    private final TrendingDealService trendingDealService;

    public TrendingDealController(
            TrendingDealService trendingDealService) {

        this.trendingDealService = trendingDealService;
    }


    // ==========================================
    // GET ALL TRENDING DEALS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<TrendingDeal>> getAllTrendingDeals() {

        return ResponseEntity.ok(
                trendingDealService.getAllTrendingDeals()
        );
    }


    // ==========================================
    // ADD TRENDING DEAL
    // ==========================================

    @PostMapping("/{productId}")
    public ResponseEntity<?> addTrendingDeal(
            @PathVariable Long productId) {

        try {

            TrendingDeal deal =
                    trendingDealService
                            .addTrendingDeal(productId);

            return ResponseEntity.ok(deal);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ==========================================
    // DELETE TRENDING DEAL
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrendingDeal(
            @PathVariable Long id) {

        try {

            trendingDealService
                    .deleteTrendingDeal(id);

            return ResponseEntity.ok(
                    "Trending deal removed successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}