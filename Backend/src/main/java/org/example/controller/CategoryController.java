package org.example.controller;

import java.io.IOException;
import java.util.List;

import org.example.entity.Category;
import org.example.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;


    // =====================================================
    // ADD CATEGORY
    // =====================================================

    @PostMapping("/add")
    public ResponseEntity<Category> addCategory(

            @RequestParam("name")
            String name,

            @RequestParam(value = "image", required = false)
            MultipartFile image

    ) throws IOException {

        Category category =
                categoryService.addCategory(
                        name,
                        image
                );

        return ResponseEntity.ok(category);
    }


    // =====================================================
    // GET ALL CATEGORIES
    // =====================================================

    @GetMapping("/all")
    public ResponseEntity<List<Category>> getAllCategories() {

        return ResponseEntity.ok(
                categoryService.getAllCategories()
        );
    }


    // =====================================================
    // GET CATEGORY COUNT
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<Long> getCategoryCount() {

        return ResponseEntity.ok(
                categoryService.getCategoryCount()
        );
    }


    // =====================================================
    // GET CATEGORY BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                categoryService.getCategoryById(id)
        );
    }


    // =====================================================
    // UPDATE CATEGORY
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(

            @PathVariable Long id,

            @RequestParam("name")
            String name,

            @RequestParam(value = "image", required = false)
            MultipartFile image

    ) throws IOException {

        Category category =
                categoryService.updateCategory(
                        id,
                        name,
                        image
                );

        return ResponseEntity.ok(category);
    }


    // =====================================================
    // DELETE CATEGORY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable Long id
    ) {

        categoryService.deleteCategory(id);

        return ResponseEntity.ok(
                "Category deleted successfully"
        );
    }
}