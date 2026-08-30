package org.example.controller;

import java.util.List;

import org.example.entity.Product;
import org.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductPublicController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getActiveProducts() {

        return productRepository.findByActiveTrue();

    }
}