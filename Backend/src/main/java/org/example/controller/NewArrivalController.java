package org.example.controller;

import java.time.LocalDate;
import java.util.List;

import org.example.entity.NewArrival;
import org.example.service.NewArrivalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
@RequestMapping("/admin/new-arrivals")
public class NewArrivalController {

    private final NewArrivalService newArrivalService;

    public NewArrivalController(NewArrivalService newArrivalService) {
        this.newArrivalService = newArrivalService;
    }

    // ============================================================
    // GET ALL NEW ARRIVALS
    // ============================================================

    @GetMapping("/all")
    public ResponseEntity<List<NewArrival>> getAllNewArrivals() {

        List<NewArrival> newArrivals =
                newArrivalService.getAllNewArrivals();

        return ResponseEntity.ok(newArrivals);
    }


    // ============================================================
    // GET NEW ARRIVAL BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getNewArrivalById(
            @PathVariable Long id) {

        try {

            NewArrival newArrival =
                    newArrivalService.getNewArrivalById(id);

            return ResponseEntity.ok(newArrival);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // ============================================================
    // ADD NEW ARRIVAL
    // ============================================================

    @PostMapping(
            value = "/add",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> addNewArrival(

            @RequestParam("productId")
            Long productId,

            @RequestParam("displayFromDate")
            String displayFromDate,

            @RequestParam("displayToDate")
            String displayToDate,

            @RequestParam("priority")
            Integer priority,

            @RequestParam(value = "image", required = false)
            MultipartFile image
    ) {

        try {

            LocalDate fromDate =
                    LocalDate.parse(displayFromDate);

            LocalDate toDate =
                    LocalDate.parse(displayToDate);

            NewArrival newArrival =
                    newArrivalService.addNewArrival(
                            productId,
                            fromDate,
                            toDate,
                            priority,
                            image
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(newArrival);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }


    // ============================================================
    // UPDATE NEW ARRIVAL
    // ============================================================

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateNewArrival(

            @PathVariable Long id,

            @RequestParam("productId")
            Long productId,

            @RequestParam("displayFromDate")
            String displayFromDate,

            @RequestParam("displayToDate")
            String displayToDate,

            @RequestParam("priority")
            Integer priority,

            @RequestParam(value = "image", required = false)
            MultipartFile image
    ) {

        try {

            LocalDate fromDate =
                    LocalDate.parse(displayFromDate);

            LocalDate toDate =
                    LocalDate.parse(displayToDate);

            NewArrival updated =
                    newArrivalService.updateNewArrival(
                            id,
                            productId,
                            fromDate,
                            toDate,
                            priority,
                            image
                    );

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // ============================================================
    // DELETE NEW ARRIVAL
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNewArrival(
            @PathVariable Long id) {

        try {

            newArrivalService.deleteNewArrival(id);

            return ResponseEntity.ok(
                    "New Arrival deleted successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // ============================================================
    // UPDATE ACTIVE STATUS
    // ============================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(

            @PathVariable Long id,

            @RequestParam("active")
            boolean active
    ) {

        try {

            NewArrival updated =
                    newArrivalService.updateActiveStatus(
                            id,
                            active
                    );

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}