package org.example.service;

import java.io.IOException;
import java.util.Optional;

import org.example.entity.Category;
import org.example.entity.CategoryImage;
import org.example.repository.CategoryImageRepository;
import org.example.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CategoryImageService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryImageRepository categoryImageRepository;

    @Autowired
    private CloudinaryService cloudinaryService;


    // =====================================================
    // ADD / CHANGE CATEGORY IMAGE
    // =====================================================

    public CategoryImage uploadCategoryImage(
            Long categoryId,
            MultipartFile file
    ) throws IOException {

        // 1. Find category
        Category category = categoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + categoryId
                        )
                );


        // 2. Upload image to Cloudinary
        var uploadResult =
                cloudinaryService.uploadImage(file);


        // 3. Get Cloudinary URL
        String imageUrl =
                uploadResult
                        .get("secure_url")
                        .toString();


        // 4. Check whether category already has an image
        Optional<CategoryImage> existingImage =
                categoryImageRepository
                        .findByCategory(category);


        CategoryImage categoryImage;


        if (existingImage.isPresent()) {

            // Update existing image
            categoryImage =
                    existingImage.get();

        } else {

            // Create new image record
            categoryImage =
                    new CategoryImage();

            categoryImage.setCategory(category);
        }


        // 5. Save Cloudinary URL
        categoryImage.setImageUrl(imageUrl);


        // 6. Save to database
        return categoryImageRepository
                .save(categoryImage);
    }


    // =====================================================
    // GET CATEGORY IMAGE
    // =====================================================

    public Optional<CategoryImage> getCategoryImage(
            Long categoryId
    ) {

        Category category =
                categoryRepository
                        .findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found with id: "
                                                + categoryId
                                )
                        );

        return categoryImageRepository
                .findByCategory(category);
    }


    // =====================================================
    // DELETE CATEGORY IMAGE
    // =====================================================

    public void deleteCategoryImage(
            Long categoryId
    ) {

        Category category =
                categoryRepository
                        .findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found with id: "
                                                + categoryId
                                )
                        );

        categoryImageRepository
                .deleteByCategory(category);
    }
}