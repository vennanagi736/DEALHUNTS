package org.example.controller;

import java.util.List;

import org.example.dto.AttributeDefinitionDTO;
import org.example.service.AttributeDefinitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/attributes")
@CrossOrigin(origins = "http://localhost:5173")
public class AttributeDefinitionController {

    private final AttributeDefinitionService service;

    public AttributeDefinitionController(
            AttributeDefinitionService service) {

        this.service = service;
    }

    // ============================================================
    // GET ACTIVE ATTRIBUTES FOR VENDOR FORM
    // ============================================================

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<AttributeDefinitionDTO>>
    getActiveAttributesByCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                service.getActiveAttributesByCategory(categoryId)
        );
    }

    // ============================================================
    // GET ALL ATTRIBUTES
    // ADMIN USE
    // ============================================================

    @GetMapping("/category/{categoryId}/all")
    public ResponseEntity<List<AttributeDefinitionDTO>>
    getAllAttributesByCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                service.getAllAttributesByCategory(categoryId)
        );
    }
}