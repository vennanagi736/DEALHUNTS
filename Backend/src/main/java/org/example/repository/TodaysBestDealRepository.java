package org.example.repository;

import java.util.List;

import org.example.entity.TodaysBestDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TodaysBestDealRepository
        extends JpaRepository<TodaysBestDeal, Long> {

    List<TodaysBestDeal> findAllByOrderByPriorityDescIdDesc();

    boolean existsByProduct_Id(Long productId);
}