package org.example.repository;

import java.util.List;

import org.example.entity.Image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository
        extends JpaRepository<Image, Long> {

    List<Image> findByProductId(Long productId);
}