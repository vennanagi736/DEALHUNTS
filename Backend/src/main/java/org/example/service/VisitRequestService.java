package org.example.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.example.entity.VisitRequest;
import org.example.entity.VisitRequestStatus;
import org.example.repository.ProductRepository;
import org.example.repository.VisitRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class VisitRequestService {

    private final VisitRequestRepository visitRequestRepository;

private final ProductRepository productRepository;

public VisitRequestService(
        VisitRequestRepository visitRequestRepository,
        ProductRepository productRepository
) {
    this.visitRequestRepository = visitRequestRepository;
    this.productRepository = productRepository;
}

    // =========================================================
    // CREATE VISIT REQUEST
    // =========================================================

    public VisitRequest createVisitRequest(VisitRequest visitRequest) {

        validateVisitRequest(visitRequest);

        visitRequest.setId(null);
        visitRequest.setStatus(VisitRequestStatus.PENDING);

        return visitRequestRepository.save(visitRequest);
    }


    // =========================================================
    // GET USER VISIT REQUESTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<VisitRequest> getUserVisitRequests(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        return visitRequestRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }


    // =========================================================
    // GET VENDOR VISIT REQUESTS
    // =========================================================
@Transactional(readOnly = true)
public List<VisitRequest> getVendorVisitRequests(Long vendorId) {

    if (vendorId == null) {
        throw new IllegalArgumentException("Vendor ID is required");
    }

    List<VisitRequest> requests =
            visitRequestRepository
                    .findByVendorIdOrderByCreatedAtDesc(vendorId);

    if (requests.isEmpty()) {
        return requests;
    }

    /*
     * Collect all product IDs from the visit requests.
     */
    List<Long> productIds =
            requests.stream()
                    .map(VisitRequest::getProductId)
                    .filter(id -> id != null)
                    .distinct()
                    .toList();

    /*
     * Load the products in one database query.
     */
    Map<Long, String> productNameMap =
            productRepository
                    .findAllById(productIds)
                    .stream()
                    .collect(
                            java.util.stream.Collectors.toMap(
                                    product -> product.getId(),
                                    product -> product.getName()
                            )
                    );

    /*
     * Attach the product name to each visit request.
     */
    requests.forEach(request -> {

        String productName =
                productNameMap.get(
                        request.getProductId()
                );

        request.setProductName(productName);
    });

    return requests;
}

    // =========================================================
    // GET VENDOR REQUESTS BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<VisitRequest> getVendorVisitRequestsByStatus(
            Long vendorId,
            VisitRequestStatus status
    ) {

        if (vendorId == null) {
            throw new IllegalArgumentException("Vendor ID is required");
        }

        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        return visitRequestRepository
                .findByVendorIdAndStatusOrderByCreatedAtDesc(
                        vendorId,
                        status
                );
    }


    // =========================================================
    // GET ALL VISIT REQUESTS - ADMIN
    // =========================================================

    @Transactional(readOnly = true)
    public List<VisitRequest> getAllVisitRequests() {

        return visitRequestRepository
                .findAll(
                        org.springframework.data.domain.Sort
                                .by(
                                        org.springframework.data.domain.Sort.Direction.DESC,
                                        "createdAt"
                                )
                );
    }


    // =========================================================
    // GET REQUEST BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public VisitRequest getVisitRequestById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("Visit request ID is required");
        }

        return visitRequestRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Visit request not found with ID: " + id
                        )
                );
    }


    // =========================================================
    // ACCEPT REQUEST - VENDOR
    // =========================================================

    public VisitRequest acceptVisitRequest(Long id, Long vendorId) {

        VisitRequest request = getVisitRequestById(id);

        validateVendorOwnership(request, vendorId);

        if (request.getStatus() != VisitRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending visit requests can be accepted"
            );
        }

        request.setStatus(VisitRequestStatus.ACCEPTED);

        return visitRequestRepository.save(request);
    }


    // =========================================================
    // REJECT REQUEST - VENDOR
    // =========================================================

    public VisitRequest rejectVisitRequest(Long id, Long vendorId) {

        VisitRequest request = getVisitRequestById(id);

        validateVendorOwnership(request, vendorId);

        if (request.getStatus() != VisitRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending visit requests can be rejected"
            );
        }

        request.setStatus(VisitRequestStatus.REJECTED);

        return visitRequestRepository.save(request);
    }

// =========================================================
// UPDATE STATUS
// =========================================================

public VisitRequest updateStatus(
        Long id,
        Long vendorId,
        VisitRequestStatus newStatus
) {

    if (newStatus == null) {
        throw new IllegalArgumentException(
                "New status is required"
        );
    }

    switch (newStatus) {

        case ACCEPTED:
            return acceptVisitRequest(
                    id,
                    vendorId
            );

        case REJECTED:
            return rejectVisitRequest(
                    id,
                    vendorId
            );

        case COMPLETED:
            return completeVisitRequest(
                    id,
                    vendorId
            );

        default:
            throw new IllegalArgumentException(
                    "Vendor cannot change the request to "
                    + newStatus
            );
    }
}


    // =========================================================
    // CANCEL REQUEST - USER
    // =========================================================

    public VisitRequest cancelVisitRequest(
            Long id,
            Long userId
    ) {

        VisitRequest request = getVisitRequestById(id);

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (!userId.equals(request.getUserId())) {
            throw new IllegalStateException(
                    "You are not allowed to cancel this visit request"
            );
        }

        if (request.getStatus() != VisitRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending visit requests can be cancelled"
            );
        }

        request.setStatus(VisitRequestStatus.CANCELLED);

        return visitRequestRepository.save(request);
    }


    // =========================================================
    // TODAY'S REQUESTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<VisitRequest> getRequestsForDate(
            LocalDate date
    ) {

        if (date == null) {
            throw new IllegalArgumentException("Date is required");
        }

        return visitRequestRepository
                .findByVisitDateOrderByVisitTimeAsc(date);
    }


    // =========================================================
    // VENDOR TODAY'S REQUESTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<VisitRequest> getVendorRequestsForDate(
            Long vendorId,
            LocalDate date
    ) {

        if (vendorId == null) {
            throw new IllegalArgumentException("Vendor ID is required");
        }

        if (date == null) {
            throw new IllegalArgumentException("Date is required");
        }

        return visitRequestRepository
                .findByVendorIdAndVisitDateOrderByVisitTimeAsc(
                        vendorId,
                        date
                );
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateVisitRequest(
            VisitRequest visitRequest
    ) {

        if (visitRequest == null) {
            throw new IllegalArgumentException(
                    "Visit request cannot be null"
            );
        }

        if (visitRequest.getProductId() == null) {
            throw new IllegalArgumentException(
                    "Product ID is required"
            );
        }

        if (visitRequest.getVendorId() == null) {
            throw new IllegalArgumentException(
                    "Vendor ID is required"
            );
        }

        if (visitRequest.getUserId() == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        if (visitRequest.getVisitDate() == null) {
            throw new IllegalArgumentException(
                    "Visit date is required"
            );
        }

        if (visitRequest.getVisitTime() == null) {
            throw new IllegalArgumentException(
                    "Visit time is required"
            );
        }

        if (visitRequest.getCustomerName() == null
                || visitRequest.getCustomerName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Customer name is required"
            );
        }

        if (visitRequest.getCustomerPhone() == null
                || visitRequest.getCustomerPhone().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Customer phone is required"
            );
        }
    }


    // =========================================================
    // VENDOR OWNERSHIP VALIDATION
    // =========================================================

    private void validateVendorOwnership(
            VisitRequest request,
            Long vendorId
    ) {

        if (vendorId == null) {
            throw new IllegalArgumentException(
                    "Vendor ID is required"
            );
        }

        if (!vendorId.equals(request.getVendorId())) {
            throw new IllegalStateException(
                    "This visit request does not belong to this vendor"
            );
        }
    }
    // =========================================================
// COMPLETE REQUEST - VENDOR
// =========================================================

public VisitRequest completeVisitRequest(
        Long id,
        Long vendorId
) {

    VisitRequest request = getVisitRequestById(id);

    validateVendorOwnership(request, vendorId);

    if (request.getStatus() != VisitRequestStatus.ACCEPTED) {
        throw new IllegalStateException(
                "Only accepted visit requests can be completed"
        );
    }

    request.setStatus(VisitRequestStatus.COMPLETED);

    return visitRequestRepository.save(request);
}
}