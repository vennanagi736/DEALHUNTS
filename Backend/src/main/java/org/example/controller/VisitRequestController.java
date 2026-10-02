package org.example.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.example.entity.VisitRequest;
import org.example.entity.VisitRequestStatus;
import org.example.service.VisitRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/visits")
@CrossOrigin(origins = "http://localhost:5173")
public class VisitRequestController {

    private final VisitRequestService visitRequestService;

    public VisitRequestController(
            VisitRequestService visitRequestService
    ) {
        this.visitRequestService = visitRequestService;
    }


    // =========================================================
    // USER
    // BOOK A VISIT
    // POST /visits/book
    // =========================================================

    @PostMapping("/book")
    public ResponseEntity<?> bookVisit(
            @RequestBody VisitRequest visitRequest
    ) {

        try {

            VisitRequest savedRequest =
                    visitRequestService.createVisitRequest(
                            visitRequest
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedRequest);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to create visit request"
                            )
                    );
        }
    }


    // =========================================================
    // USER
    // GET USER REQUESTS
    //
    // GET /visits/user/{userId}
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserVisits(
            @PathVariable Long userId
    ) {

        try {

            List<VisitRequest> requests =
                    visitRequestService.getUserVisitRequests(
                            userId
                    );

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // USER
    // GET SINGLE REQUEST
    //
    // GET /visits/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getVisitById(
            @PathVariable Long id
    ) {

        try {

            VisitRequest request =
                    visitRequestService.getVisitRequestById(id);

            return ResponseEntity.ok(request);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // USER
    // CANCEL REQUEST
    //
    // DELETE /visits/{id}?userId=123
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelVisit(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {

        try {

            VisitRequest cancelledRequest =
                    visitRequestService.cancelVisitRequest(
                            id,
                            userId
                    );

            return ResponseEntity.ok(cancelledRequest);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to cancel visit request"
                            )
                    );
        }
    }


    // =========================================================
    // VENDOR
    // GET ALL VENDOR REQUESTS
    //
    // GET /visits/vendor/{vendorId}
    // =========================================================

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorVisits(
            @PathVariable Long vendorId
    ) {

        try {

            List<VisitRequest> requests =
                    visitRequestService.getVendorVisitRequests(
                            vendorId
                    );

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // VENDOR
    // GET REQUESTS BY STATUS
    //
    // GET /visits/vendor/{vendorId}/status/PENDING
    // =========================================================

    @GetMapping("/vendor/{vendorId}/status/{status}")
    public ResponseEntity<?> getVendorVisitsByStatus(
            @PathVariable Long vendorId,
            @PathVariable VisitRequestStatus status
    ) {

        try {

            List<VisitRequest> requests =
                    visitRequestService
                            .getVendorVisitRequestsByStatus(
                                    vendorId,
                                    status
                            );

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // VENDOR
    // ACCEPT / REJECT
    //
    // PUT /visits/{id}/status
    //
    // Body:
    // {
    //     "status": "ACCEPTED",
    //     "vendorId": 10
    // }
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateVisitStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {

        try {

            if (body == null || body.get("status") == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Status is required"
                                )
                        );
            }

            if (body.get("vendorId") == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Vendor ID is required"
                                )
                        );
            }

            String statusValue =
                    String.valueOf(
                            body.get("status")
                    ).trim().toUpperCase();

            Long vendorId =
                    Long.valueOf(
                            String.valueOf(
                                    body.get("vendorId")
                            )
                    );

            VisitRequestStatus status =
                    VisitRequestStatus.valueOf(
                            statusValue
                    );

            VisitRequest updatedRequest =
                    visitRequestService.updateStatus(
                            id,
                            vendorId,
                            status
                    );

            return ResponseEntity.ok(updatedRequest);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to update visit request"
                            )
                    );
        }
    }


    // =========================================================
    // ADMIN
    // GET ALL VISIT REQUESTS
    //
    // GET /visits/admin/all
    // =========================================================

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllVisits() {

        try {

            List<VisitRequest> requests =
                    visitRequestService.getAllVisitRequests();

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load visit requests"
                            )
                    );
        }
    }


    // =========================================================
    // GET REQUESTS FOR A DATE
    //
    // GET /visits/date/2026-09-30
    // =========================================================

    @GetMapping("/date/{date}")
    public ResponseEntity<?> getVisitsForDate(
            @PathVariable String date
    ) {

        try {

            LocalDate visitDate =
                    LocalDate.parse(date);

            List<VisitRequest> requests =
                    visitRequestService
                            .getRequestsForDate(
                                    visitDate
                            );

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid date. Use yyyy-MM-dd"
                            )
                    );
        }
    }


    // =========================================================
    // VENDOR
    // GET VENDOR REQUESTS FOR DATE
    //
    // GET /visits/vendor/{vendorId}/date/2026-09-30
    // =========================================================

    @GetMapping("/vendor/{vendorId}/date/{date}")
    public ResponseEntity<?> getVendorVisitsForDate(
            @PathVariable Long vendorId,
            @PathVariable String date
    ) {

        try {

            LocalDate visitDate =
                    LocalDate.parse(date);

            List<VisitRequest> requests =
                    visitRequestService
                            .getVendorRequestsForDate(
                                    vendorId,
                                    visitDate
                            );

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid date. Use yyyy-MM-dd"
                            )
                    );
        }
    }
}