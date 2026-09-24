package org.example.controller;

import java.util.List;

import org.example.entity.Variant;
import org.example.repository.VariantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin
public class VariantController {

    private final VariantRepository variantRepository;

    public VariantController(
            VariantRepository variantRepository
    ) {
        this.variantRepository = variantRepository;
    }

    @GetMapping("/{productId}/variants")
    public ResponseEntity<?> getProductVariants(
            @PathVariable Long productId
    ) {

        List<Variant> variants =
                variantRepository.findByProductId(productId);

        return ResponseEntity.ok(variants);
    }
    @GetMapping("/variants/{variantId}")
public ResponseEntity<?> getVariantById(
        @PathVariable Long variantId
) {

    return variantRepository
            .findById(variantId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
}