package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    List<Brand> findByActiveTrueOrderByNameAsc();

    Optional<Brand> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}