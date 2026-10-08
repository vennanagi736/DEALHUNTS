package org.example.controller;

import java.time.LocalDate;
import java.util.List;

import org.example.entity.ComingSoon;
import org.example.service.ComingSoonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
public class ComingSoonController {

    // ============================================================
    // SERVICE
    // ============================================================

    @Autowired
    private ComingSoonService comingSoonService;

    // ============================================================
    // ADMIN - GET ALL
    // ============================================================

    @GetMapping("/admin/coming-soon/all")
    public ResponseEntity<?> getAllComingSoonProducts() {

        try {

            return ResponseEntity.ok(
                    comingSoonService
                            .getAllComingSoonProducts()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to load Coming Soon products"
                    );
        }
    }

    // ============================================================
    // ADMIN - GET BY ID
    // ============================================================

    @GetMapping("/admin/coming-soon/{id}")
    public ResponseEntity<?> getComingSoonById(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    comingSoonService
                            .getComingSoonById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // ADMIN - ADD
    // ============================================================

    @PostMapping(
            value = "/admin/coming-soon/add",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> addComingSoon(

            @RequestParam("productName")
            String productName,

            @RequestParam("brand")
            String brand,

            @RequestParam("description")
            String description,

            @RequestParam("displayFromDate")
            String displayFromDate,

            @RequestParam("displayToDate")
            String displayToDate,

            @RequestParam("priority")
            Integer priority,

            @RequestParam(value = "images", required = false)
            MultipartFile[] images

    ) {

        try {

            LocalDate fromDate =
                    LocalDate.parse(
                            displayFromDate
                    );

            LocalDate toDate =
                    LocalDate.parse(
                            displayToDate
                    );

            ComingSoon saved =
                    comingSoonService.addComingSoon(
                            productName,
                            brand,
                            description,
                            fromDate,
                            toDate,
                            priority,
                            images
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(saved);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to add Coming Soon product: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // ADMIN - UPDATE
    // ============================================================

    @PutMapping(
            value = "/admin/coming-soon/{id}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> updateComingSoon(

            @PathVariable Long id,

            @RequestParam("productName")
            String productName,

            @RequestParam("brand")
            String brand,

            @RequestParam("description")
            String description,

            @RequestParam("displayFromDate")
            String displayFromDate,

            @RequestParam("displayToDate")
            String displayToDate,

            @RequestParam("priority")
            Integer priority,

            @RequestParam(value = "images", required = false)
            MultipartFile[] images

    ) {

        try {

            LocalDate fromDate =
                    LocalDate.parse(
                            displayFromDate
                    );

            LocalDate toDate =
                    LocalDate.parse(
                            displayToDate
                    );

            ComingSoon updated =
                    comingSoonService.updateComingSoon(
                            id,
                            productName,
                            brand,
                            description,
                            fromDate,
                            toDate,
                            priority,
                            images
                    );

            return ResponseEntity.ok(
                    updated
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to update Coming Soon product: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // ADMIN - DELETE
    // ============================================================

    @DeleteMapping("/admin/coming-soon/{id}")
    public ResponseEntity<?> deleteComingSoon(
            @PathVariable Long id
    ) {

        try {

            comingSoonService.deleteComingSoon(id);

            return ResponseEntity.ok(
                    "Coming Soon product deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to delete Coming Soon product"
                    );
        }
    }

    // ============================================================
    // ADMIN - ENABLE / DISABLE
    // ============================================================

    @PutMapping("/admin/coming-soon/{id}/status")
    public ResponseEntity<?> updateStatus(

            @PathVariable Long id,

            @RequestParam("active")
            boolean active

    ) {

        try {

            ComingSoon updated =
                    comingSoonService
                            .updateActiveStatus(
                                    id,
                                    active
                            );

            return ResponseEntity.ok(
                    updated
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // ============================================================
    // USER - CURRENTLY ACTIVE PRODUCTS
    // ============================================================

    @GetMapping("/coming-soon/active")
    public ResponseEntity<?> getActiveComingSoonProducts() {

        try {

            /*
             * The service automatically uses LocalDate.now().
             *
             * Therefore:
             *
             * Before start date -> hidden
             * During range      -> visible
             * After end date    -> hidden
             */
            List<ComingSoon> products =
                    comingSoonService
                            .getActiveComingSoonProducts();

            return ResponseEntity.ok(
                    products
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Failed to load active Coming Soon products"
                    );
        }
    }
}
