package org.example.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.example.entity.WhyDealHunts;
import org.example.service.WhyDealHuntsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/why-dealhunts")
@CrossOrigin(origins = "http://localhost:5173")
public class WhyDealHuntsController {

    private final WhyDealHuntsService service;

    public WhyDealHuntsController(WhyDealHuntsService service) {
        this.service = service;
    }

    // ============================================================
    // GET ALL BENEFITS
    // ============================================================

    @GetMapping("/all")
    public ResponseEntity<List<WhyDealHunts>> getAllBenefits() {

        return ResponseEntity.ok(
                service.getAllBenefits()
        );
    }

    // ============================================================
    // ADD BENEFIT
    // ============================================================

    @PostMapping("/add")
    public ResponseEntity<?> addBenefit(
            @RequestBody WhyDealHunts benefit
    ) {

        try {

            WhyDealHunts savedBenefit =
                    service.addBenefit(
                            benefit.getTitle(),
                            benefit.getDescription(),
                            benefit.getIcon()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedBenefit);

        } catch (RuntimeException e) {

            Map<String, String> response =
                    new HashMap<>();

            response.put("message", e.getMessage());

            return ResponseEntity
                    .badRequest()
                    .body(response);
        }
    }

    // ============================================================
    // DELETE BENEFIT
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBenefit(
            @PathVariable Long id
    ) {

        try {

            service.deleteBenefit(id);

            Map<String, String> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Benefit removed successfully."
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            Map<String, String> response =
                    new HashMap<>();

            response.put("message", e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(response);
        }
    }
}