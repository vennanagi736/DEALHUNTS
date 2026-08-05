package org.example.controller;

import java.util.List;

import org.example.entity.Promotion;
import org.example.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/promotions")
@CrossOrigin(origins = "http://localhost:5173")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService){
        this.promotionService = promotionService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addPromotion(
        @RequestParam("title") String title,
        @RequestParam("priority") Integer priority,
        @RequestParam("startDate") String startDate,
        @RequestParam("endDate") String endDate,
        @RequestParam("images") List<MultipartFile> images
    ){
        Promotion promotion = promotionService.addPromotion(
            title,
            priority,
            startDate,
            endDate,
            images
        );

        return ResponseEntity.ok("Add Promotion");

    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPromotions() {

        return ResponseEntity.ok(
            promotionService.getAll()
        );

    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(
            @PathVariable Long id) {

        return ResponseEntity.ok("Update Promotion : " + id);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(
            @PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok("Promotion Deleted");

    }
    @GetMapping("/trending")
public ResponseEntity<?> getTrendingPromotions() {
    System.out.println("Trending is calling");

    return ResponseEntity.ok(
            promotionService.getTrendingPromotions()
    );

}

}