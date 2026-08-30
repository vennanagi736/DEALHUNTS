package org.example.repository;

import java.util.List;

import org.example.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductAttributeValueRepository
        extends JpaRepository<ProductAttributeValue, Long> {

    List<ProductAttributeValue>
    findByProductId(Long productId);
}