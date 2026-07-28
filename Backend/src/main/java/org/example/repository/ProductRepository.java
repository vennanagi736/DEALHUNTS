package org.example.repository;

import java.util.List;

import org.example.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByNameAsc();

    List<Product> findByNameContainingIgnoreCase(String name);

    boolean existsByNameAndBrandAndCategory(
            String name,
            String brand,
            String category
    );
    Product findByNameAndBrandAndCategory(
        String name,
        String brand,
        String category
    );

}