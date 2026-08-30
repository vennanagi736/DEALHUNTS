package org.example.repository;

import java.util.List;

import org.example.entity.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {

    List<Color> findByProductId(Long productId);

    List<Color> findByVariantId(Long variantId);

    boolean existsByVariantIdAndNameAndHexCode(
        Long variantId,
        String name,
        String hexCode
    );
}