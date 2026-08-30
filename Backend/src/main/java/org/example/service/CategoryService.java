package org.example.service;

import java.io.IOException;
import java.util.List;

import org.example.entity.Category;
import org.example.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;


    // =====================================================
    // ADD CATEGORY WITH IMAGE
    // =====================================================

    public Category addCategory(
            String name,
            MultipartFile image
    ) throws IOException {

        Category category = new Category();

        category.setName(name);


        // Upload image if provided
        if (image != null && !image.isEmpty()) {

            var uploadResult =
                    cloudinaryService.uploadImage(image);

            String imageUrl =
                    uploadResult
                            .get("secure_url")
                            .toString();

            category.setImageUrl(imageUrl);
        }


        return categoryRepository.save(category);
    }


    // =====================================================
    // GET ALL CATEGORIES
    // =====================================================

    public List<Category> getAllCategories() {

        return categoryRepository.findAll();

    }


    // =====================================================
    // GET CATEGORY BY ID
    // =====================================================

    public Category getCategoryById(Long id) {

        return categoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + id
                        )
                );

    }


    // =====================================================
    // UPDATE CATEGORY
    // =====================================================

    public Category updateCategory(
            Long id,
            String name,
            MultipartFile image
    ) throws IOException {

        Category category =
                categoryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found with id: " + id
                                )
                        );


        // Update name
        if (name != null && !name.trim().isEmpty()) {

            category.setName(name.trim());

        }


        // Update image only if a new image was selected
        if (image != null && !image.isEmpty()) {

            var uploadResult =
                    cloudinaryService.uploadImage(image);

            String imageUrl =
                    uploadResult
                            .get("secure_url")
                            .toString();

            category.setImageUrl(imageUrl);

        }


        return categoryRepository.save(category);

    }


    // =====================================================
    // DELETE CATEGORY
    // =====================================================

    public void deleteCategory(Long id) {

        Category category =
                categoryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found with id: " + id
                                )
                        );

        categoryRepository.delete(category);

    }
    public long getCategoryCount() {

    return categoryRepository.count();

}
}