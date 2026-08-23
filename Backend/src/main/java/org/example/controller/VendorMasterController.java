package org.example.controller;

import java.util.List;

import org.example.entity.VendorBrand;
import org.example.entity.VendorCategory;
import org.example.service.VendorBrandService;
import org.example.service.VendorCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor")
@CrossOrigin(origins = "http://localhost:5173")
public class VendorMasterController {

    private final VendorCategoryService vendorCategoryService;
    private final VendorBrandService vendorBrandService;

    public VendorMasterController(
            VendorCategoryService vendorCategoryService,
            VendorBrandService vendorBrandService) {

        this.vendorCategoryService = vendorCategoryService;
        this.vendorBrandService = vendorBrandService;
    }

    // =========================================================
    // SAVE CATEGORY
    // =========================================================

    @PostMapping("/category")
    public ResponseEntity<?> saveCategory(
            @RequestParam int vendorId,
            @RequestParam Long categoryId) {

        try {

            VendorCategory saved =
                    vendorCategoryService.saveCategory(
                            vendorId,
                            categoryId
                    );

            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // SAVE BRAND
    // =========================================================

    @PostMapping("/brand")
    public ResponseEntity<?> saveBrand(
            @RequestParam int vendorId,
            @RequestParam Long brandId) {

        try {

            VendorBrand saved =
                    vendorBrandService.saveBrand(
                            vendorId,
                            brandId
                    );

            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET VENDOR CATEGORIES
    // =========================================================

    @GetMapping("/myCategories")
    public ResponseEntity<?> getVendorCategories(
            @RequestParam int vendorId) {

        try {

            List<VendorCategory> categories =
                    vendorCategoryService
                            .getVendorCategories(vendorId);

            return ResponseEntity.ok(categories);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET VENDOR BRANDS
    // =========================================================

    @GetMapping("/myBrands")
    public ResponseEntity<?> getVendorBrands(
            @RequestParam int vendorId) {

        try {

            List<VendorBrand> brands =
                    vendorBrandService
                            .getVendorBrands(vendorId);

            return ResponseEntity.ok(brands);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}