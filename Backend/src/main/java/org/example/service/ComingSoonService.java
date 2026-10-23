
package org.example.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.example.entity.ComingSoon;
import org.example.repository.ComingSoonRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ComingSoonService {

    private static final String CLOUDINARY_FOLDER =
            "dealhunts/coming-soon";

    private final ComingSoonRepository comingSoonRepository;
    private final Cloudinary cloudinary;

    public ComingSoonService(
            ComingSoonRepository comingSoonRepository,
            Cloudinary cloudinary
    ) {
        this.comingSoonRepository = comingSoonRepository;
        this.cloudinary = cloudinary;
    }

    // GET ALL - ADMIN

    public List<ComingSoon> getAllComingSoonProducts() {
        return comingSoonRepository.findAll();
    }

    // GET ACTIVE - USER

    public List<ComingSoon> getActiveComingSoonProducts() {
        LocalDate today = LocalDate.now();

        return comingSoonRepository
                .findByActiveTrueAndDisplayFromDateLessThanEqualAndDisplayToDateGreaterThanEqualOrderByPriorityDesc(
                        today,
                        today
                );
    }

    // GET BY ID

    public ComingSoon getComingSoonById(Long id) {
        return comingSoonRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coming Soon product not found with id: " + id
                        )
                );
    }

    // ADD

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
                productName, brand, description,
                displayFromDate, displayToDate, priority
        );

        ComingSoon comingSoon = new ComingSoon();
        comingSoon.setProductName(productName.trim());
        comingSoon.setBrand(brand.trim());
        comingSoon.setDescription(description.trim());
        comingSoon.setDisplayFromDate(displayFromDate);
        comingSoon.setDisplayToDate(displayToDate);
        comingSoon.setPriority(priority);
        comingSoon.setActive(true);

        List<String> imageUrls = saveImages(images);
        comingSoon.setImageUrls(imageUrls);

        return comingSoonRepository.save(comingSoon);
    }

    // UPDATE

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

        ComingSoon comingSoon = getComingSoonById(id);

        validateData(
                productName, brand, description,
                displayFromDate, displayToDate, priority
        );

        comingSoon.setProductName(productName.trim());
        comingSoon.setBrand(brand.trim());
        comingSoon.setDescription(description.trim());
        comingSoon.setDisplayFromDate(displayFromDate);
        comingSoon.setDisplayToDate(displayToDate);
        comingSoon.setPriority(priority);

        // Replace existing images only if valid new images are supplied.
        if (images != null && images.length > 0) {
            List<String> newImageUrls = saveImages(images);

            if (!newImageUrls.isEmpty()) {
                deleteOldImages(comingSoon.getImageUrls());
                comingSoon.setImageUrls(newImageUrls);
            }
        }

        return comingSoonRepository.save(comingSoon);
    }

    // DELETE

    public void deleteComingSoon(Long id) throws IOException {
        ComingSoon comingSoon = getComingSoonById(id);

        deleteOldImages(comingSoon.getImageUrls());
        comingSoonRepository.delete(comingSoon);
    }

    // MANUAL ACTIVE / INACTIVE

    public ComingSoon updateActiveStatus(Long id, boolean active) {
        ComingSoon comingSoon = getComingSoonById(id);
        comingSoon.setActive(active);

        return comingSoonRepository.save(comingSoon);
    }

    // VALIDATION

    private void validateData(
            String productName,
            String brand,
            String description,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority
    ) {
        if (productName == null || productName.trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }

        if (brand == null || brand.trim().isEmpty()) {
            throw new IllegalArgumentException("Brand is required");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }

        if (displayFromDate == null) {
            throw new IllegalArgumentException("Display From date is required");
        }

        if (displayToDate == null) {
            throw new IllegalArgumentException("Display Until date is required");
        }

        if (displayToDate.isBefore(displayFromDate)) {
            throw new IllegalArgumentException(
                    "Display Until date cannot be before Display From date"
            );
        }

        if (priority == null || priority < 1) {
            throw new IllegalArgumentException("Priority must be at least 1");
        }
    }

    // UPLOAD IMAGES TO CLOUDINARY

    private List<String> saveImages(
            MultipartFile[] images
    ) throws IOException {

        List<String> imageUrls = new ArrayList<>();

        if (images == null || images.length == 0) {
            return imageUrls;
        }

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            validateImage(image);

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    image.getBytes(),
                    ObjectUtils.asMap(
                            "folder", CLOUDINARY_FOLDER,
                            "resource_type", "image"
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");

            if (secureUrl == null) {
                throw new IOException(
                        "Cloudinary did not return an image URL."
                );
            }

            imageUrls.add(secureUrl.toString());
        }

        return imageUrls;
    }

    private void validateImage(MultipartFile image) {
        String contentType = image.getContentType();

        if (contentType == null ||
                !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }

        if (image.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Each image must be smaller than 2 MB"
            );
        }
    }

    // DELETE CLOUDINARY IMAGES; IGNORE LEGACY LOCAL PATHS

    private void deleteOldImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        for (String imageUrl : imageUrls) {
            if (imageUrl == null || imageUrl.isBlank()) {
                continue;
            }

            if (!imageUrl.startsWith("https://res.cloudinary.com/") &&
                    !imageUrl.startsWith("http://res.cloudinary.com/")) {
                // Old /uploads/... paths are not Cloudinary assets.
                continue;
            }

            try {
                String publicId = extractPublicId(imageUrl);

                if (publicId != null && !publicId.isBlank()) {
                    Map<?, ?> result = cloudinary.uploader().destroy(
                            publicId,
                            ObjectUtils.emptyMap()
                    );

                    Object status = result.get("result");

                    if (status != null &&
                            !"ok".equals(status.toString()) &&
                            !"not found".equals(status.toString())) {
                        System.err.println(
                                "Cloudinary deletion result for "
                                        + imageUrl + ": " + status
                        );
                    }
                }
            } catch (Exception e) {
                // Do not block database updates/deletion on image cleanup.
                System.err.println(
                        "Could not delete image from Cloudinary: "
                                + imageUrl + " - " + e.getMessage()
                );
            }
        }
    }

    private String extractPublicId(String imageUrl) {
        int uploadIndex = imageUrl.indexOf("/upload/");

        if (uploadIndex < 0) {
            return null;
        }

        String path = imageUrl.substring(
                uploadIndex + "/upload/".length()
        );

        // Remove transformation segment if present.
        if (path.startsWith("w_") ||
                path.startsWith("c_") ||
                path.startsWith("q_") ||
                path.startsWith("f_")) {
            int slashIndex = path.indexOf('/');

            if (slashIndex >= 0) {
                path = path.substring(slashIndex + 1);
            }
        }

        // Remove Cloudinary version, e.g. v123456789/
        if (path.matches("^v\\d+/.*")) {
            path = path.substring(path.indexOf('/') + 1);
        }

        int extensionIndex = path.lastIndexOf('.');

        if (extensionIndex >= 0) {
            path = path.substring(0, extensionIndex);
        }

        return path;
    }
}
