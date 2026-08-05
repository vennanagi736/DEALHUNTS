package org.example.repository;

import java.time.LocalDate;
import java.util.List;

import org.example.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByPriorityAsc(
            LocalDate startDate,
            LocalDate endDate
    );

}