package org.example.controller;

import java.io.IOException;
import java.util.Optional;

import org.example.entity.CategoryImage;
import org.example.service.CategoryImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryImageController {

    @Autowired
    private CategoryImageService categoryImageService;


    // =====================================================
    // UPLOAD / CHANGE CATEGORY IMAGE
    // =====================================================

    @PostMapping("/{categoryId}/image")
    public ResponseEntity<?> uploadCategoryImage(
            @PathVariable Long categoryId,
            @RequestParam("image") MultipartFile file
    ) {

        try {

            if (file == null || file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Please select an image");

            }


            CategoryImage categoryImage =
                    categoryImageService.uploadCategoryImage(
                            categoryId,
                            file
                    );


            return ResponseEntity.ok(categoryImage);


        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to upload image");


        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }

    }


    // =====================================================
    // GET CATEGORY IMAGE
    // =====================================================

    @GetMapping("/{categoryId}/image")
    public ResponseEntity<?> getCategoryImage(
            @PathVariable Long categoryId
    ) {

        try {

            Optional<CategoryImage> image =
                    categoryImageService
                            .getCategoryImage(categoryId);


            if (image.isPresent()) {

                return ResponseEntity.ok(
                        image.get()
                );

            }


            return ResponseEntity
                    .notFound()
                    .build();


        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }

    }


    // =====================================================
    // DELETE CATEGORY IMAGE
    // =====================================================

    @DeleteMapping("/{categoryId}/image")
    public ResponseEntity<?> deleteCategoryImage(
            @PathVariable Long categoryId
    ) {

        try {

            categoryImageService
                    .deleteCategoryImage(categoryId);


            return ResponseEntity.ok(
                    "Category image deleted successfully"
            );


        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }

    }
}