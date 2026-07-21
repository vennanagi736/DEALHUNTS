package org.example.repository;

import java.util.List;

import org.example.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
        extends JpaRepository<Product, Long> {
    
    List<Product> findAllByOrderByNameAsc();
    List<Product> findByNameContainingIgnoreCase(String name);

}