package org.example.repository;

import org.example.entity.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ColorRepository 
extends JpaRepository<Color, Integer> {


    boolean existsByProductIdAndNameAndHexCode(
            Long productId,
            String name,
            String hexCode
    );

}