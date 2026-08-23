package org.example.repository;

import java.util.List;

import org.example.entity.TrendingDeal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrendingDealRepository
        extends JpaRepository<TrendingDeal, Long> {

    List<TrendingDeal> findAllByOrderByPositionAsc();

    boolean existsByProductId(Long productId);
}