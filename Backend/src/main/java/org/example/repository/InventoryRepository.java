package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.dto.VendorProductDTO;
import org.example.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    List<Inventory> findByVendor_Id(int id);

    Optional<Inventory> findByProduct_Id(Long productId);
    @Query("""
    SELECT new org.example.dto.VendorProductDTO(
        i.product.id,
        i.product.name,
        i.product.description,
        i.product.brand,
        i.product.category,
        i.variant.id,
        i.color.id,
        i.sellingPrice,
        i.stock
    )
    FROM Inventory i
    WHERE i.vendor.id = :vendorId
      AND i.product.active = true
    """)
List<VendorProductDTO> findActiveProductsByVendorId(
        @Param("vendorId") int vendorId);
}