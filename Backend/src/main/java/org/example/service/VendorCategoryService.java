package org.example.service;

import java.util.List;

import org.example.entity.Category;
import org.example.entity.Vendor;
import org.example.entity.VendorCategory;
import org.example.repository.CategoryRepository;
import org.example.repository.VendorCategoryRepository;
import org.example.repository.VendorRepository;
import org.springframework.stereotype.Service;

@Service
public class VendorCategoryService {

    private final VendorCategoryRepository vendorCategoryRepository;
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;

    public VendorCategoryService(
            VendorCategoryRepository vendorCategoryRepository,
            VendorRepository vendorRepository,
            CategoryRepository categoryRepository) {

        this.vendorCategoryRepository = vendorCategoryRepository;
        this.vendorRepository = vendorRepository;
        this.categoryRepository = categoryRepository;
    }


    // =========================================================
    // SAVE CATEGORY FOR VENDOR
    // =========================================================

    public VendorCategory saveCategory(
            int vendorId,
            Long categoryId) {

        // Find vendor
        Vendor vendor =
                vendorRepository.findById(vendorId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        // Find category
        Category category =
                categoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"
                                )
                        );


        // Prevent duplicate
        boolean alreadyExists =
                vendorCategoryRepository
                        .existsByVendorIdAndCategoryId(
                                vendorId,
                                categoryId
                        );


        if (alreadyExists) {

            throw new RuntimeException(
                    "Category already added to vendor"
            );

        }


        // Create mapping
        VendorCategory vendorCategory =
                new VendorCategory();

        vendorCategory.setVendor(vendor);
        vendorCategory.setCategory(category);


        return vendorCategoryRepository.save(
                vendorCategory
        );
    }


    // =========================================================
    // GET VENDOR CATEGORIES
    // =========================================================

    public List<VendorCategory> getVendorCategories(
            int vendorId) {

        return vendorCategoryRepository
                .findByVendorId(vendorId);
    }
}