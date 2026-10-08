package org.example.service;

import org.example.entity.NewArrival;
import org.example.entity.Product;
import org.example.repository.NewArrivalRepository;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class NewArrivalService {

    // ============================================================
    // IMAGE STORAGE
    // ============================================================

    private static final String UPLOAD_DIR =
            "uploads/new-arrivals";


    // ============================================================
    // REPOSITORIES
    // ============================================================

    private final NewArrivalRepository newArrivalRepository;
    private final ProductRepository productRepository;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public NewArrivalService(
            NewArrivalRepository newArrivalRepository,
            ProductRepository productRepository
    ) {

        this.newArrivalRepository = newArrivalRepository;
        this.productRepository = productRepository;
    }


    // ============================================================
    // GET ALL NEW ARRIVALS
    // ============================================================

    public List<NewArrival> getAllNewArrivals() {

        return newArrivalRepository.findAll();
    }


    // ============================================================
    // GET NEW ARRIVAL BY ID
    // ============================================================

    public NewArrival getNewArrivalById(Long id) {

        return newArrivalRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "New Arrival not found with id: " + id
                        )
                );
    }


    // ============================================================
    // ADD NEW ARRIVAL
    // ============================================================

    public NewArrival addNewArrival(

            Long productId,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority,
            MultipartFile image

    ) {

        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        validateDates(
                displayFromDate,
                displayToDate
        );

        validatePriority(priority);


        // --------------------------------------------------------
        // FIND PRODUCT
        // --------------------------------------------------------

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );


        // --------------------------------------------------------
        // CREATE NEW ARRIVAL
        // --------------------------------------------------------

        NewArrival newArrival = new NewArrival();

        newArrival.setProduct(product);

        newArrival.setDisplayFromDate(
                displayFromDate
        );

        newArrival.setDisplayToDate(
                displayToDate
        );

        newArrival.setPriority(priority);

        newArrival.setActive(true);


        // --------------------------------------------------------
        // SAVE IMAGE
        // --------------------------------------------------------

        if (image != null && !image.isEmpty()) {

            String imageUrl =
                    saveImage(image);

            newArrival.setImageUrl(imageUrl);
        }


        // --------------------------------------------------------
        // SAVE DATABASE RECORD
        // --------------------------------------------------------

        return newArrivalRepository.save(newArrival);
    }


    // ============================================================
    // UPDATE NEW ARRIVAL
    // ============================================================

    public NewArrival updateNewArrival(

            Long id,
            Long productId,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority,
            MultipartFile image

    ) {

        // --------------------------------------------------------
        // FIND EXISTING RECORD
        // --------------------------------------------------------

        NewArrival newArrival =
                getNewArrivalById(id);


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        validateDates(
                displayFromDate,
                displayToDate
        );

        validatePriority(priority);


        // --------------------------------------------------------
        // FIND PRODUCT
        // --------------------------------------------------------

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );


        // --------------------------------------------------------
        // UPDATE BASIC INFORMATION
        // --------------------------------------------------------

        newArrival.setProduct(product);

        newArrival.setDisplayFromDate(
                displayFromDate
        );

        newArrival.setDisplayToDate(
                displayToDate
        );

        newArrival.setPriority(priority);


        // --------------------------------------------------------
        // UPDATE IMAGE ONLY WHEN NEW IMAGE IS PROVIDED
        // --------------------------------------------------------

        if (image != null && !image.isEmpty()) {

            // Delete old image
            deleteImage(
                    newArrival.getImageUrl()
            );

            // Save new image
            String imageUrl =
                    saveImage(image);

            newArrival.setImageUrl(imageUrl);
        }


        // --------------------------------------------------------
        // SAVE
        // --------------------------------------------------------

        return newArrivalRepository.save(newArrival);
    }


    // ============================================================
    // DELETE NEW ARRIVAL
    // ============================================================

    public void deleteNewArrival(Long id) {

        NewArrival newArrival =
                getNewArrivalById(id);


        // Delete image from disk
        deleteImage(
                newArrival.getImageUrl()
        );


        // Delete database record
        newArrivalRepository.delete(newArrival);
    }


    // ============================================================
    // UPDATE ACTIVE STATUS
    // ============================================================

    public NewArrival updateActiveStatus(
            Long id,
            boolean active
    ) {

        NewArrival newArrival =
                getNewArrivalById(id);

        newArrival.setActive(active);

        return newArrivalRepository.save(newArrival);
    }


    // ============================================================
    // SAVE IMAGE
    // ============================================================

    private String saveImage(
            MultipartFile image
    ) {

        try {

            // ----------------------------------------------------
            // VALIDATE FILE
            // ----------------------------------------------------

            if (image.isEmpty()) {

                throw new IllegalArgumentException(
                        "Image file is empty."
                );
            }


            // ----------------------------------------------------
            // MAX SIZE = 2 MB
            // ----------------------------------------------------

            long maxSize =
                    2 * 1024 * 1024;

            if (image.getSize() > maxSize) {

                throw new IllegalArgumentException(
                        "Image size must be less than 2 MB."
                );
            }


            // ----------------------------------------------------
            // VALIDATE IMAGE TYPE
            // ----------------------------------------------------

            String contentType =
                    image.getContentType();

            if (contentType == null ||
                    !contentType.startsWith("image/")) {

                throw new IllegalArgumentException(
                        "Only image files are allowed."
                );
            }


            // ----------------------------------------------------
            // CREATE DIRECTORY
            // ----------------------------------------------------

            Path uploadPath =
                    Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {

                Files.createDirectories(uploadPath);
            }


            // ----------------------------------------------------
            // GET EXTENSION
            // ----------------------------------------------------

            String originalName =
                    image.getOriginalFilename();

            String extension = "";

            if (originalName != null &&
                    originalName.contains(".")) {

                extension =
                        originalName.substring(
                                originalName.lastIndexOf(".")
                        );
            }


            // ----------------------------------------------------
            // GENERATE UNIQUE FILE NAME
            // ----------------------------------------------------

            String fileName =
                    UUID.randomUUID()
                            + extension;


            // ----------------------------------------------------
            // SAVE FILE
            // ----------------------------------------------------

            Path filePath =
                    uploadPath.resolve(fileName);

            Files.copy(
                    image.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );


            // ----------------------------------------------------
            // RETURN URL
            // ----------------------------------------------------

            return "/uploads/new-arrivals/" + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save New Arrival image.",
                    e
            );
        }
    }


    // ============================================================
    // DELETE IMAGE
    // ============================================================

    private void deleteImage(
            String imageUrl
    ) {

        if (imageUrl == null ||
                imageUrl.isBlank()) {

            return;
        }

        try {

            String fileName =
                    imageUrl.substring(
                            imageUrl.lastIndexOf("/") + 1
                    );

            Path filePath =
                    Paths.get(
                            UPLOAD_DIR,
                            fileName
                    );

            Files.deleteIfExists(filePath);

        } catch (Exception e) {

            // Do not stop database operations
            // if image deletion fails.

            System.err.println(
                    "Unable to delete New Arrival image: "
                            + e.getMessage()
            );
        }
    }


    // ============================================================
    // DATE VALIDATION
    // ============================================================

    private void validateDates(

            LocalDate displayFromDate,
            LocalDate displayToDate

    ) {

        if (displayFromDate == null) {

            throw new IllegalArgumentException(
                    "Display From Date is required."
            );
        }

        if (displayToDate == null) {

            throw new IllegalArgumentException(
                    "Display To Date is required."
            );
        }

        if (displayToDate.isBefore(displayFromDate)) {

            throw new IllegalArgumentException(
                    "Display To Date cannot be before Display From Date."
            );
        }
    }


    // ============================================================
    // PRIORITY VALIDATION
    // ============================================================

    private void validatePriority(
            Integer priority
    ) {

        if (priority == null) {

            throw new IllegalArgumentException(
                    "Priority is required."
            );
        }

        if (priority < 1) {

            throw new IllegalArgumentException(
                    "Priority must be at least 1."
            );
        }
    }
}