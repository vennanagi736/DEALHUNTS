package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.AvailableNearYou;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailableNearYouRepository
        extends JpaRepository<AvailableNearYou, Long> {

    Optional<AvailableNearYou> findByProductId(Long productId);

    boolean existsByProductId(Long productId);

    List<AvailableNearYou> findAllByOrderByIdAsc();
}