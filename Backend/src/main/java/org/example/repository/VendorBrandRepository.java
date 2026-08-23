package org.example.repository;

import java.util.List;

import org.example.entity.VendorBrand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorBrandRepository
        extends JpaRepository<VendorBrand, Long> {

    List<VendorBrand> findByVendorId(int vendorId);

    boolean existsByVendorIdAndBrandId(
            int vendorId,
            Long brandId
    );
}