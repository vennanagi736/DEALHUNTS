package org.example.controller;

import org.example.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/user/promotions")
@CrossOrigin(origins = "http://localhost:5173")
public class PromotionUserController {

    private final PromotionService promotionService;

    public PromotionUserController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public ResponseEntity<?> getTrendingPromotions() {
        return ResponseEntity.ok(
                promotionService.getTrendingPromotions()
        );
    }
}