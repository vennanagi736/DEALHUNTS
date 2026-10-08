package org.example.repository;

import java.time.LocalDate;
import java.util.List;

import org.example.entity.NewArrival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NewArrivalRepository
        extends JpaRepository<NewArrival, Long> {


    // ============================================================
    // ADMIN - ALL
    // ============================================================

    @Query("""
            SELECT na
            FROM NewArrival na
            JOIN FETCH na.product p
            LEFT JOIN FETCH p.images
            WHERE na.active = true
            ORDER BY na.priority DESC, na.id DESC
            """)
    List<NewArrival> findAllActiveForAdmin();


    // ============================================================
    // USER - CURRENTLY DISPLAYABLE
    //
    // From date <= today
    // To date >= today
    // ============================================================

    @Query("""
            SELECT na
            FROM NewArrival na
            JOIN FETCH na.product p
            LEFT JOIN FETCH p.images
            WHERE na.active = true
              AND na.displayFromDate <= :today
              AND na.displayToDate >= :today
              AND p.active = true
            ORDER BY na.priority DESC, na.id DESC
            """)
    List<NewArrival> findCurrentlyVisible(
            @Param("today") LocalDate today
    );


    // ============================================================
    // CHECK DUPLICATE PRODUCT
    // ============================================================

    boolean existsByProductId(Long productId);


    // ============================================================
    // CHECK DUPLICATE PRODUCT EXCLUDING CURRENT RECORD
    // ============================================================

    boolean existsByProductIdAndIdNot(
            Long productId,
            Long id
    );
}
