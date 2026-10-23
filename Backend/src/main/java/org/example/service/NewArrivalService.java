
package org.example.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.example.entity.NewArrival;
import org.example.entity.Product;
import org.example.repository.NewArrivalRepository;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class NewArrivalService {

    private static final String CLOUDINARY_FOLDER =
            "dealhunts/new-arrivals";

    private final NewArrivalRepository newArrivalRepository;
    private final ProductRepository productRepository;
    private final Cloudinary cloudinary;

    public NewArrivalService(
            NewArrivalRepository newArrivalRepository,
            ProductRepository productRepository,
            Cloudinary cloudinary
    ) {
        this.newArrivalRepository = newArrivalRepository;
        this.productRepository = productRepository;
        this.cloudinary = cloudinary;
    }

    // GET ALL NEW ARRIVALS

    public List<NewArrival> getAllNewArrivals() {
        return newArrivalRepository.findAll();
    }

    // GET NEW ARRIVAL BY ID

    public NewArrival getNewArrivalById(Long id) {
        return newArrivalRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "New Arrival not found with id: " + id
                        )
                );
    }

    // ADD NEW ARRIVAL

    public NewArrival addNewArrival(
            Long productId,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority,
            MultipartFile image
    ) {
        validateDates(displayFromDate, displayToDate);
        validatePriority(priority);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: " + productId
                        )
                );

        NewArrival newArrival = new NewArrival();
        newArrival.setProduct(product);
        newArrival.setDisplayFromDate(displayFromDate);
        newArrival.setDisplayToDate(displayToDate);
        newArrival.setPriority(priority);
        newArrival.setActive(true);

        if (image != null && !image.isEmpty()) {
            newArrival.setImageUrl(saveImage(image));
        }

        return newArrivalRepository.save(newArrival);
    }

    // UPDATE NEW ARRIVAL

    public NewArrival updateNewArrival(
            Long id,
            Long productId,
            LocalDate displayFromDate,
            LocalDate displayToDate,
            Integer priority,
            MultipartFile image
    ) {
        NewArrival newArrival = getNewArrivalById(id);

        validateDates(displayFromDate, displayToDate);
        validatePriority(priority);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: " + productId
                        )
                );

        newArrival.setProduct(product);
        newArrival.setDisplayFromDate(displayFromDate);
        newArrival.setDisplayToDate(displayToDate);
        newArrival.setPriority(priority);

        if (image != null && !image.isEmpty()) {
            String newImageUrl = saveImage(image);
            deleteImage(newArrival.getImageUrl());
            newArrival.setImageUrl(newImageUrl);
        }

        return newArrivalRepository.save(newArrival);
    }

    // DELETE NEW ARRIVAL

    public void deleteNewArrival(Long id) {
        NewArrival newArrival = getNewArrivalById(id);

        deleteImage(newArrival.getImageUrl());
        newArrivalRepository.delete(newArrival);
    }

    // UPDATE ACTIVE STATUS

    public NewArrival updateActiveStatus(Long id, boolean active) {
        NewArrival newArrival = getNewArrivalById(id);
        newArrival.setActive(active);
        return newArrivalRepository.save(newArrival);
    }

    // UPLOAD IMAGE TO CLOUDINARY

    private String saveImage(MultipartFile image) {
        validateImage(image);

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    image.getBytes(),
                    ObjectUtils.asMap(
                            "folder", CLOUDINARY_FOLDER,
                            "resource_type", "image"
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");

            if (secureUrl == null) {
                throw new RuntimeException(
                        "Cloudinary did not return an image URL."
                );
            }

            return secureUrl.toString();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to upload New Arrival image to Cloudinary.",
                    e
            );
        }
    }

    // VALIDATE IMAGE

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image file is empty.");
        }

        if (image.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Image size must be less than 2 MB."
            );
        }

        String contentType = image.getContentType();

        if (contentType == null ||
                !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Only image files are allowed."
            );
        }
    }

    // DELETE CLOUDINARY IMAGE
    // Also safely ignores legacy local URLs.

    private void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        if (!imageUrl.contains("/res.cloudinary.com/") &&
                !imageUrl.startsWith("https://res.cloudinary.com/") &&
                !imageUrl.startsWith("http://res.cloudinary.com/")) {
            // Legacy local URL: no local-file deletion needed on Render.
            return;
        }

        try {
            String publicId = extractPublicId(imageUrl);

            if (publicId != null && !publicId.isBlank()) {
                cloudinary.uploader().destroy(
                        publicId,
                        ObjectUtils.emptyMap()
                );
            }
        } catch (Exception e) {
            // Image deletion failure should not block database deletion.
            System.err.println(
                    "Unable to delete New Arrival image from Cloudinary: "
                            + e.getMessage()
            );
        }
    }

    private String extractPublicId(String imageUrl) {
        int uploadIndex = imageUrl.indexOf("/upload/");

        if (uploadIndex < 0) {
            return null;
        }

        String path = imageUrl.substring(uploadIndex + "/upload/".length());

        // Remove Cloudinary transformations if present.
        if (path.startsWith("w_") ||
                path.startsWith("c_") ||
                path.startsWith("q_") ||
                path.startsWith("f_")) {
            int slashIndex = path.indexOf('/');
            if (slashIndex >= 0) {
                path = path.substring(slashIndex + 1);
            }
        }

        // Remove version segment, e.g. v123456789/
        if (path.matches("^v\\d+/.*")) {
            path = path.substring(path.indexOf('/') + 1);
        }

        int extensionIndex = path.lastIndexOf('.');
        if (extensionIndex >= 0) {
            path = path.substring(0, extensionIndex);
        }

        return path;
    }

    // DATE VALIDATION

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

    // PRIORITY VALIDATION

    private void validatePriority(Integer priority) {
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
