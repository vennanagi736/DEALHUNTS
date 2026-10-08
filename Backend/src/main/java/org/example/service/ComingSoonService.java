package org.example.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.example.entity.ComingSoon;
import org.example.repository.ComingSoonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ComingSoonService {

    // ============================================================
    // UPLOAD DIRECTORY
    // ============================================================

    private static final String UPLOAD_DIRECTORY =
            "uploads/coming-soon";

    // ============================================================
    // REPOSITORY
    // ============================================================

    @Autowired
    private ComingSoonRepository comingSoonRepository;

    // ============================================================
    // GET ALL - ADMIN
    // ============================================================

    public List<ComingSoon> getAllComingSoonProducts() {

        return comingSoonRepository.findAll();
    }

    // ============================================================
    // GET ACTIVE - USER
    // ============================================================

    public List<ComingSoon> getActiveComingSoonProducts() {

        LocalDate today = LocalDate.now();

        return comingSoonRepository
                .findByActiveTrueAndDisplayFromDateLessThanEqualAndDisplayToDateGreaterThanEqualOrderByPriorityDesc(
                        today,
                        today
                );
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    public ComingSoon getComingSoonById(Long id) {

        return comingSoonRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coming Soon product not found with id: " + id
                        )
                );
    }

    // ============================================================
    // ADD
    // ============================================================

    public ComingSoon addComingSoon(
            String productName,
            String brand,
            String description,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority,
            MultipartFile[] images
    ) throws IOException {

        validateData(
                productName,
                brand,
                description,
                displayFromDate,
                displayToDate,
                priority
        );

        ComingSoon comingSoon = new ComingSoon();

        comingSoon.setProductName(productName.trim());
        comingSoon.setBrand(brand.trim());
        comingSoon.setDescription(description.trim());
        comingSoon.setDisplayFromDate(displayFromDate);
        comingSoon.setDisplayToDate(displayToDate);
        comingSoon.setPriority(priority);
        comingSoon.setActive(true);

        List<String> imageUrls =
                saveImages(images);

        comingSoon.setImageUrls(imageUrls);

        return comingSoonRepository.save(comingSoon);
    }

    // ============================================================
    // UPDATE
    // ============================================================

    public ComingSoon updateComingSoon(
            Long id,
            String productName,
            String brand,
            String description,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority,
            MultipartFile[] images
    ) throws IOException {

        ComingSoon comingSoon =
                getComingSoonById(id);

        validateData(
                productName,
                brand,
                description,
                displayFromDate,
                displayToDate,
                priority
        );

        comingSoon.setProductName(productName.trim());
        comingSoon.setBrand(brand.trim());
        comingSoon.setDescription(description.trim());
        comingSoon.setDisplayFromDate(displayFromDate);
        comingSoon.setDisplayToDate(displayToDate);
        comingSoon.setPriority(priority);

        /*
         * If new images are supplied during edit,
         * replace the old images.
         *
         * If no new images are supplied,
         * keep the existing images.
         */
        if (images != null && images.length > 0) {

            List<String> newImageUrls =
                    saveImages(images);

            if (!newImageUrls.isEmpty()) {

                deleteOldImages(
                        comingSoon.getImageUrls()
                );

                comingSoon.setImageUrls(
                        newImageUrls
                );
            }
        }

        return comingSoonRepository.save(comingSoon);
    }

    // ============================================================
    // DELETE
    // ============================================================

    public void deleteComingSoon(Long id)
            throws IOException {

        ComingSoon comingSoon =
                getComingSoonById(id);

        deleteOldImages(
                comingSoon.getImageUrls()
        );

        comingSoonRepository.delete(comingSoon);
    }

    // ============================================================
    // MANUAL ACTIVE / INACTIVE
    // ============================================================

    public ComingSoon updateActiveStatus(
            Long id,
            boolean active
    ) {

        ComingSoon comingSoon =
                getComingSoonById(id);

        comingSoon.setActive(active);

        return comingSoonRepository.save(
                comingSoon
        );
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateData(
            String productName,
            String brand,
            String description,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority
    ) {

        if (productName == null ||
                productName.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Product name is required"
            );
        }

        if (brand == null ||
                brand.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Brand is required"
            );
        }

        if (description == null ||
                description.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Description is required"
            );
        }

        if (displayFromDate == null) {

            throw new IllegalArgumentException(
                    "Display From date is required"
            );
        }

        if (displayToDate == null) {

            throw new IllegalArgumentException(
                    "Display Until date is required"
            );
        }

        /*
         * Display Until cannot be before Display From.
         */
        if (displayToDate.isBefore(displayFromDate)) {

            throw new IllegalArgumentException(
                    "Display Until date cannot be before Display From date"
            );
        }

        if (priority == null ||
                priority < 1) {

            throw new IllegalArgumentException(
                    "Priority must be at least 1"
            );
        }
    }

    // ============================================================
    // SAVE IMAGES
    // ============================================================

    private List<String> saveImages(
            MultipartFile[] images
    ) throws IOException {

        List<String> imageUrls =
                new ArrayList<>();

        if (images == null ||
                images.length == 0) {

            return imageUrls;
        }

        Path uploadPath =
                Paths.get(UPLOAD_DIRECTORY);

        Files.createDirectories(
                uploadPath
        );

        for (MultipartFile image : images) {

            if (image == null ||
                    image.isEmpty()) {

                continue;
            }

            String contentType =
                    image.getContentType();

            if (contentType == null ||
                    !contentType.startsWith("image/")) {

                throw new IllegalArgumentException(
                        "Only image files are allowed"
                );
            }

            /*
             * Maximum 2 MB per image.
             */
            if (image.getSize() > 2 * 1024 * 1024) {

                throw new IllegalArgumentException(
                        "Each image must be smaller than 2 MB"
                );
            }

            String originalFilename =
                    image.getOriginalFilename();

            String extension = "";

            if (originalFilename != null &&
                    originalFilename.contains(".")) {

                extension =
                        originalFilename.substring(
                                originalFilename.lastIndexOf(".")
                        );
            }

            String filename =
                    UUID.randomUUID()
                            + extension;

            Path targetPath =
                    uploadPath.resolve(filename);

            Files.copy(
                    image.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            String imageUrl =
                    "/uploads/coming-soon/" + filename;

            imageUrls.add(imageUrl);
        }

        return imageUrls;
    }

    // ============================================================
    // DELETE OLD IMAGES
    // ============================================================

    private void deleteOldImages(
            List<String> imageUrls
    ) {

        if (imageUrls == null ||
                imageUrls.isEmpty()) {

            return;
        }

        for (String imageUrl : imageUrls) {

            if (imageUrl == null ||
                    imageUrl.isBlank()) {

                continue;
            }

            try {

                String relativePath =
                        imageUrl.startsWith("/")
                                ? imageUrl.substring(1)
                                : imageUrl;

                Path filePath =
                        Paths.get(relativePath);

                Files.deleteIfExists(
                        filePath
                );

            } catch (Exception e) {

                /*
                 * Do not stop database deletion/update
                 * just because an old image cannot be
                 * removed.
                 */
                System.err.println(
                        "Could not delete image: "
                                + imageUrl
                );
            }
        }
    }
}
