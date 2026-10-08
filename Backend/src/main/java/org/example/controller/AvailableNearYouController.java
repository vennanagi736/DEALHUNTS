package org.example.controller;

import java.util.List;
import java.util.Map;

import org.example.dto.AvailableNearYouAdminDTO;
import org.example.dto.AvailableNearYouResponseDTO;
import org.example.service.AvailableNearYouService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/available-near-you")
@CrossOrigin(origins = "http://localhost:5173")
public class AvailableNearYouController {

    private final AvailableNearYouService availableNearYouService;

    public AvailableNearYouController(
            AvailableNearYouService availableNearYouService
    ) {
        this.availableNearYouService =
                availableNearYouService;
    }

    // ============================================================
    // ADMIN - GET ALL SELECTED PRODUCTS
    // ============================================================

    @GetMapping("/all")
    public ResponseEntity<List<AvailableNearYouAdminDTO>>
    getAll() {

        return ResponseEntity.ok(
                availableNearYouService
                        .getAllSelectedProducts()
        );
    }

    // ============================================================
    // ADMIN - ADD PRODUCT
    // ============================================================

    @PostMapping("/add")
    public ResponseEntity<?> add(
            @RequestBody Map<String, Long> request
    ) {

        try {

            Long productId =
                    request.get("productId");

            return ResponseEntity.ok(
                    availableNearYouService
                            .addProduct(productId)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // ADMIN - DELETE PRODUCT
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {

        try {

            availableNearYouService
                    .removeProduct(id);

            return ResponseEntity.ok(
                    "Product removed successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // USER - FIND NEARBY PRODUCTS
    // ============================================================

    @GetMapping("/nearby")
    public ResponseEntity<?> findNearbyProducts(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) String search
    ) {

        try {

            List<AvailableNearYouResponseDTO> results =
                    availableNearYouService.findNearbyProducts(
                            latitude,
                            longitude,
                            search
                    );

            return ResponseEntity.ok(results);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}