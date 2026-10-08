package org.example.controller;

import java.util.List;

import org.example.dto.AvailableNearYouResponseDTO;
import org.example.service.AvailableNearYouService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/available-near-you")
@CrossOrigin(origins = "http://localhost:5173")
public class UserAvailableNearYouController {

    private final AvailableNearYouService availableNearYouService;

    public UserAvailableNearYouController(
            AvailableNearYouService availableNearYouService
    ) {
        this.availableNearYouService =
                availableNearYouService;
    }

    // ============================================================
    // FIND PRODUCTS NEAR USER
    // ============================================================

    @GetMapping
    public ResponseEntity<?> findNearbyProducts(

            @RequestParam Double latitude,

            @RequestParam Double longitude,

            @RequestParam(required = false)
            String search
    ) {

        try {

            List<AvailableNearYouResponseDTO> results =
                    availableNearYouService
                            .findNearbyProducts(
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