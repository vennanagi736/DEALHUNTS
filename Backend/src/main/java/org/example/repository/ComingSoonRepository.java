package org.example.repository;

import java.time.LocalDate;
import java.util.List;

import org.example.entity.ComingSoon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComingSoonRepository
        extends JpaRepository<ComingSoon, Long> {

    // ============================================================
    // USER-FACING ACTIVE COMING SOON PRODUCTS
    // ============================================================

    /*
     * Returns ONLY products that should currently be visible.
     *
     * Rules:
     *
     * 1. active must be true
     * 2. displayFromDate must be today or earlier
     * 3. displayToDate must be today or later
     *
     * Therefore:
     *
     * Before displayFromDate -> NOT returned
     * During date range       -> returned
     * After displayToDate     -> NOT returned
     */
    List<ComingSoon>
    findByActiveTrueAndDisplayFromDateLessThanEqualAndDisplayToDateGreaterThanEqualOrderByPriorityDesc(
            LocalDate fromDate,
            LocalDate toDate
    );

    // ============================================================
    // ADMIN
    // ============================================================

    /*
     * Admin needs to see ALL records, including expired ones.
     *
     * JpaRepository.findAll() is already enough for this.
     */
}
