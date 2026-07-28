package org.example.controller;

import java.util.List;

import org.example.entity.Product;
import org.example.entity.Category;
import org.example.entity.Brand;
import org.example.entity.Color;
import org.example.entity.Variant;

import org.example.repository.BrandRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.ColorRepository;
import org.example.repository.VariantRepository;
import org.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;


import org.springframework.web.bind.annotation.PutMapping;
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
@RequestMapping("/admin/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private VariantRepository variantRepository;

    // Add Product
    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    // Get All Products
    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // Search Product
    @GetMapping("/search")
    public List<Product> searchProduct(@RequestParam String name) {
        return productService.searchProduct(name);
    }

    // Get Product By ID
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    //edit options
    @PutMapping("/category/{id}")
public ResponseEntity<String> updateCategory(
        @PathVariable Long id,
        @RequestBody Category category) {

    Category existing = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
    existing.setName(category.getName());
    categoryRepository.save(existing);
    return ResponseEntity.ok("Category updated successfully");
    }

    @PutMapping("/brand/{id}")
public ResponseEntity<String> updateBrand(
        @PathVariable Integer id,
        @RequestBody Brand brand) {

    Brand existing = brandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Brand not found"));
    existing.setName(brand.getName());
    brandRepository.save(existing);
    return ResponseEntity.ok("Brand updated successfully");
    }
    @PutMapping("/color/{id}")
public ResponseEntity<String> updateColor(
        @PathVariable Integer id,
        @RequestBody Color color) {

    Color existing = colorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Color not found"));
    existing.setName(color.getName());
    existing.setHexCode(color.getHexCode());
    colorRepository.save(existing);
    return ResponseEntity.ok("Color updated successfully");
    }
    @PutMapping("/variant/{id}")
public ResponseEntity<String> updateVariant(
        @PathVariable Integer id,
        @RequestBody Variant variant) {

    Variant existing = variantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Variant not found"));
    existing.setName(variant.getName());
    existing.setRam(variant.getRam());
    existing.setStorage(variant.getStorage());
    variantRepository.save(existing);
    return ResponseEntity.ok("Variant updated successfully");
    }


    // Delete Product
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    // Delete Category
    @DeleteMapping("/category/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok("Category deleted successfully");
    }

    // Delete Brand
    @DeleteMapping("/brand/{id}")
    public ResponseEntity<String> deleteBrand(@PathVariable Integer id) {
        brandRepository.deleteById(id);
        return ResponseEntity.ok("Brand deleted successfully");
    }

    // Delete Color
    @DeleteMapping("/color/{id}")
    public ResponseEntity<String> deleteColor(@PathVariable Integer id) {
        colorRepository.deleteById(id);
        return ResponseEntity.ok("Color deleted successfully");
    }

    // Delete Variant
    @DeleteMapping("/variant/{id}")
    public ResponseEntity<String> deleteVariant(@PathVariable Integer id) {
        variantRepository.deleteById(id);
        return ResponseEntity.ok("Variant deleted successfully");
    }
}