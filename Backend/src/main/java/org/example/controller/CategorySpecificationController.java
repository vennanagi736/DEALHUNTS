package org.example.controller;

import java.util.List;

import org.example.entity.CategorySpecification;
import org.example.repository.CategorySpecificationRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category-specifications")
@CrossOrigin(origins = "http://localhost:5173")
public class CategorySpecificationController {

    private final CategorySpecificationRepository repository;

    public CategorySpecificationController(
            CategorySpecificationRepository repository) {
        this.repository = repository;
    }

    // ============================================================
    // GET SPECIFICATIONS BY CATEGORY
    // ============================================================

    @GetMapping("/{category}")
    public List<CategorySpecification> getSpecifications(
            @PathVariable String category) {

        return repository.findByCategory(category);
    }
}