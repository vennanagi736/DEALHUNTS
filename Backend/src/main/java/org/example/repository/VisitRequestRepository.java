package org.example.repository;

import java.time.LocalDate;
import java.util.List;

import org.example.entity.VisitRequest;
import org.example.entity.VisitRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {

    // =========================================================
    // USER REQUESTS
    // =========================================================

    List<VisitRequest> findByUserIdOrderByCreatedAtDesc(Long userId);


    // =========================================================
    // VENDOR REQUESTS
    // =========================================================

    List<VisitRequest> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    List<VisitRequest> findByVendorIdAndStatusOrderByCreatedAtDesc(
            Long vendorId,
            VisitRequestStatus status
    );


    // =========================================================
    // ADMIN / STATUS
    // =========================================================

    List<VisitRequest> findByStatusOrderByCreatedAtDesc(
            VisitRequestStatus status
    );


    // =========================================================
    // DATE
    // =========================================================

    List<VisitRequest> findByVisitDateOrderByVisitTimeAsc(
            LocalDate visitDate
    );


    // =========================================================
    // VENDOR + DATE
    // =========================================================

    List<VisitRequest> findByVendorIdAndVisitDateOrderByVisitTimeAsc(
            Long vendorId,
            LocalDate visitDate
    );


    // =========================================================
    // VENDOR + STATUS + DATE
    // =========================================================

    List<VisitRequest> findByVendorIdAndStatusAndVisitDateOrderByVisitTimeAsc(
            Long vendorId,
            VisitRequestStatus status,
            LocalDate visitDate
    );
}