package org.example.repository;

import org.example.entity.Variant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariantRepository 
extends JpaRepository<Variant, Integer> {


    boolean existsByProductIdAndRamAndStorage(
            Long productId,
            String ram,
            String storage
    );


}