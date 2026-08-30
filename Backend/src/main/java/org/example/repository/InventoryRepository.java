package org.example.repository;

import java.util.List;

import org.example.dto.InventoryVendorDTO;
import org.example.dto.ProductCardDTO;
import org.example.dto.VendorProductDTO;
import org.example.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    // ============================================================
    // VENDOR INVENTORY
    // ============================================================

    List<Inventory> findByVendor_Id(int id);


    // ============================================================
    // PRODUCT INVENTORY
    // ============================================================

    List<Inventory> findByProduct_Id(Long productId);


    // ============================================================
    // AVAILABLE VENDORS FOR PRODUCT
    // ============================================================

    @Query("""
        SELECT new org.example.dto.InventoryVendorDTO(

            i.id,

            i.vendor.id,

            i.vendor.shopName,

            i.product.basePrice,

            (
                i.product.basePrice -
                (
                    i.product.basePrice *
                    COALESCE(i.discount, 0) / 100.0
                )
            ),

            i.condition,

            i.stock,

            COALESCE(i.discount, 0),

            i.warranty,

            i.deliveryTime,

            i.homeDelivery,

            i.storePickup,

            i.cod,

            i.emi,

            i.exchange,

            i.offerTitle,

            i.offerDescription,

            i.returnPolicy,

            i.minPurchase,

            i.maxPurchase
        )

        FROM Inventory i

        WHERE i.product.id = :productId

          AND i.product.active = true

          AND i.stock > 0

        ORDER BY
        (
            i.product.basePrice -
            (
                i.product.basePrice *
                COALESCE(i.discount, 0) / 100.0
            )
        ) ASC
    """)
    List<InventoryVendorDTO> findAvailableVendorsByProductId(
            @Param("productId") Long productId
    );


    // ============================================================
    // VENDOR PRODUCTS
    // ============================================================

    @Query("""
        SELECT new org.example.dto.VendorProductDTO(

            i.product.id,

            i.product.name,

            i.product.description,

            i.product.brand.name,

            i.product.category.name,

            i.variant.id,

            i.color.id,

            i.product.basePrice,

            COALESCE(i.discount, 0),

            (
                i.product.basePrice -
                (
                    i.product.basePrice *
                    COALESCE(i.discount, 0) / 100.0
                )
            ),

            i.stock
        )

        FROM Inventory i

        WHERE i.vendor.id = :vendorId

          AND i.product.active = true
    """)
    List<VendorProductDTO> findActiveProductsByVendorId(
            @Param("vendorId") int vendorId
    );


    // ============================================================
    // USER PRODUCT CARDS
    // ============================================================

    @Query("""
        SELECT new org.example.dto.ProductCardDTO(

            i.product.id,

            i.product.name,

            i.product.brand.name,

            i.product.category.name,

            MIN(img.thumbnailUrl),

            MIN(
                i.product.basePrice -
                (
                    i.product.basePrice *
                    COALESCE(i.discount, 0) / 100.0
                )
            ),

            MAX(COALESCE(i.discount, 0))
        )

        FROM Inventory i

        JOIN i.product p

        LEFT JOIN p.images img

        WHERE p.active = true

          AND i.stock > 0

        GROUP BY
            i.product.id,
            i.product.name,
            i.product.brand.name,
            i.product.category.name

        ORDER BY i.product.name ASC
    """)
    List<ProductCardDTO> findActiveProductCards();
}