package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.Variant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariantRepository
        extends JpaRepository<Variant, Long> {

    List<Variant> findByProductId(Long productId);

    Optional<Variant> findByProductIdAndNameIgnoreCase(
        Long productId,
        String name
    );
}
