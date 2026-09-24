package org.example.controller;

import java.util.List;

import org.example.entity.Color;
import org.example.repository.ColorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin
public class ColorController {

    private final ColorRepository colorRepository;

    public ColorController(
            ColorRepository colorRepository
    ) {
        this.colorRepository = colorRepository;
    }

    @GetMapping("/{productId}/colors")
    public ResponseEntity<?> getProductColors(
            @PathVariable Long productId
    ) {

        List<Color> colors =
                colorRepository.findByProductId(productId);

        return ResponseEntity.ok(colors);
    }

    @GetMapping("/variants/{variantId}/colors")
    public ResponseEntity<?> getVariantColors(
            @PathVariable Long variantId
    ) {

        List<Color> colors =
                colorRepository.findByVariantId(variantId);

        return ResponseEntity.ok(colors);
    }
    @GetMapping("/colors/{colorId}")
public ResponseEntity<?> getColorById(
        @PathVariable Long colorId
) {

    return colorRepository
            .findById(colorId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
}