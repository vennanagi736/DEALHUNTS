package org.example.service;

import java.util.List;

import org.example.entity.Brand;
import org.example.entity.Vendor;
import org.example.entity.VendorBrand;
import org.example.repository.BrandRepository;
import org.example.repository.VendorBrandRepository;
import org.example.repository.VendorRepository;
import org.springframework.stereotype.Service;

@Service
public class VendorBrandService {

    private final VendorBrandRepository vendorBrandRepository;
    private final VendorRepository vendorRepository;
    private final BrandRepository brandRepository;

    public VendorBrandService(
            VendorBrandRepository vendorBrandRepository,
            VendorRepository vendorRepository,
            BrandRepository brandRepository) {

        this.vendorBrandRepository = vendorBrandRepository;
        this.vendorRepository = vendorRepository;
        this.brandRepository = brandRepository;
    }


    // =========================================================
    // SAVE BRAND FOR VENDOR
    // =========================================================

    public VendorBrand saveBrand(
            int vendorId,
            Long brandId) {

        // Find vendor
        Vendor vendor =
                vendorRepository.findById(vendorId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        // Find brand
        Brand brand =
                brandRepository.findById(brandId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Brand not found"
                                )
                        );


        // Prevent duplicate
        boolean alreadyExists =
                vendorBrandRepository
                        .existsByVendorIdAndBrandId(
                                vendorId,
                                brandId
                        );


        if (alreadyExists) {

            throw new RuntimeException(
                    "Brand already added to vendor"
            );

        }


        // Create mapping
        VendorBrand vendorBrand =
                new VendorBrand();

        vendorBrand.setVendor(vendor);
        vendorBrand.setBrand(brand);


        return vendorBrandRepository.save(
                vendorBrand
        );
    }


    // =========================================================
    // GET VENDOR BRANDS
    // =========================================================

    public List<VendorBrand> getVendorBrands(
            int vendorId) {

        return vendorBrandRepository
                .findByVendorId(vendorId);
    }
}