package org.example.repository;

import org.example.entity.PromotionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionImageRepository extends JpaRepository<PromotionImage, Long> {

}