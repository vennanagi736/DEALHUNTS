package org.example.repository;

import org.example.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductAttributeValueRepository
        extends JpaRepository<ProductAttributeValue, Long> {

    @Modifying
    @Query("DELETE FROM ProductAttributeValue p WHERE p.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}