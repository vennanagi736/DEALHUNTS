package org.example.repository;

import java.util.List;

import org.example.entity.VendorCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorCategoryRepository
        extends JpaRepository<VendorCategory, Long> {

    List<VendorCategory> findByVendorId(int vendorId);

    boolean existsByVendorIdAndCategoryId(
            int vendorId,
            Long categoryId
    );
}