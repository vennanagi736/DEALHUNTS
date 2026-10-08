package org.example.controller;

import java.util.List;

import org.example.dto.TodaysBestDealDTO;
import org.example.service.TodaysBestDealService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/todays-best-deals")
public class TodaysBestDealController {

    private final TodaysBestDealService todaysBestDealService;

    public TodaysBestDealController(
            TodaysBestDealService todaysBestDealService
    ) {
        this.todaysBestDealService =
                todaysBestDealService;
    }

    // ============================================================
    // GET ALL
    // ============================================================

    @GetMapping("/all")
    public ResponseEntity<List<TodaysBestDealDTO>> getAllDeals() {

        return ResponseEntity.ok(
                todaysBestDealService.getAllDeals()
        );
    }

    // ============================================================
    // ADD
    // ============================================================

    @PostMapping("/add")
    public ResponseEntity<?> addDeal(
            @RequestBody TodaysBestDealDTO dto
    ) {

        try {

            TodaysBestDealDTO saved =
                    todaysBestDealService.addDeal(dto);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(saved);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // UPDATE
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDeal(
            @PathVariable Long id,
            @RequestBody TodaysBestDealDTO dto
    ) {

        try {

            TodaysBestDealDTO updated =
                    todaysBestDealService.updateDeal(
                            id,
                            dto
                    );

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // DELETE
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDeal(
            @PathVariable Long id
    ) {

        try {

            todaysBestDealService.deleteDeal(id);

            return ResponseEntity.ok(
                    "Today's Best Deal deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}