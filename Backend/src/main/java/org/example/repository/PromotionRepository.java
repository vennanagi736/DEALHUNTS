package org.example.repository;

import java.time.LocalDate;
import java.util.List;

import org.example.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByPriorityAsc(
            LocalDate startDate,
            LocalDate endDate
    );
    @Query("""
    SELECT COUNT(p)
    FROM Promotion p
    WHERE p.startDate <= CURRENT_TIMESTAMP
      AND p.endDate >= CURRENT_TIMESTAMP
""")
long countActivePromotions();

}