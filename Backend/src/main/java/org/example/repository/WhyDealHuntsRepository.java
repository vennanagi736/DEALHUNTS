package org.example.repository;

import org.example.entity.WhyDealHunts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WhyDealHuntsRepository extends JpaRepository<WhyDealHunts, Long> {

    boolean existsByTitleIgnoreCase(String title);
}