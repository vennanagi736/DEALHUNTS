package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository
        extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByNameAsc();

    List<Product> findByNameContainingIgnoreCase(
            String name
    );

    boolean existsByNameAndBrandIdAndCategoryId(
            String name,
            Long brandId,
            Long categoryId
    );

    Product findByNameAndBrandIdAndCategoryId(
            String name,
            Long brandId,
            Long categoryId
    );

    List<Product> findByActiveTrue();

    // ============================================================
    // PRODUCT + SPECIFICATIONS
    // ============================================================

    @Query("""
        SELECT DISTINCT p
        FROM Product p
        LEFT JOIN FETCH p.attributeValues pav
        LEFT JOIN FETCH pav.attribute
        WHERE p.id = :id
    """)
    Optional<Product> findProductWithSpecifications(
            @Param("id") Long id
    );
}