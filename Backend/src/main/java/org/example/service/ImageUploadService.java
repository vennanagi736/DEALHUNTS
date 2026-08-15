package org.example.service;

import java.util.List;
import java.util.Map;

import org.example.entity.Image;
import org.example.entity.Product;
import org.example.repository.ImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;
    private final ImageRepository imageRepository;

    public ImageUploadService(
            Cloudinary cloudinary,
            ImageRepository imageRepository
    ) {
        this.cloudinary = cloudinary;
        this.imageRepository = imageRepository;
    }

    // =====================================================
    // UPLOAD NEW IMAGES
    // =====================================================

    public void uploadImages(
            MultipartFile[] files,
            Product product
    ) throws Exception {

        System.out.println("Product id = " + product.getId());

        for (MultipartFile file : files) {

            System.out.println(
                    "file: " + file.getOriginalFilename()
            );

            Map uploadResult =
                    cloudinary.uploader()
                            .upload(
                                    file.getBytes(),
                                    ObjectUtils.asMap(
                                            "folder",
                                            "dealhunts/products"
                                    )
                            );

            String imageUrl =
                    uploadResult.get("secure_url").toString();

            System.out.println(
                    "url: " + imageUrl
            );

            Image image = new Image();

            image.setProduct(product);

            image.setThumbnailUrl(imageUrl);

            image.setImageStatus("ACTIVE");

            imageRepository.save(image);

            System.out.println("Image saved");
        }
    }

    // =====================================================
    // GET PRODUCT IMAGES
    // =====================================================

    public List<String> getProductImages(Long productId) {

        return imageRepository.findByProductId(productId)
                .stream()
                .map(Image::getThumbnailUrl)
                .toList();
    }

    // =====================================================
    // EXTRACT CLOUDINARY PUBLIC ID
    // =====================================================

    private String extractPublicId(String imageUrl) {

        String path = imageUrl.substring(
                imageUrl.indexOf("/upload/") + 8
        );

        // Remove version such as v1754728392/
        if (path.startsWith("v")) {

            int slashIndex = path.indexOf("/");

            if (slashIndex != -1) {
                path = path.substring(
                        slashIndex + 1
                );
            }
        }

        // Remove file extension
        int dotIndex = path.lastIndexOf(".");

        if (dotIndex != -1) {
            path = path.substring(0, dotIndex);
        }

        return path;
    }

    // =====================================================
    // DELETE IMAGE FROM CLOUDINARY
    // =====================================================

    private void deleteFromCloudinary(
            String imageUrl
    ) throws Exception {

        String publicId =
                extractPublicId(imageUrl);

        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
        );

        System.out.println(
                "Deleted from Cloudinary: "
                        + publicId
        );
    }

    // =====================================================
    // DELETE IMAGE
    // =====================================================

    public void deleteImage(
            Long imageId
    ) throws Exception {

        Image image =
                imageRepository.findById(imageId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Image not found"
                                )
                        );

        // Get Cloudinary URL
        String imageUrl =
                image.getThumbnailUrl();

        // Delete from Cloudinary
        deleteFromCloudinary(imageUrl);

        // Delete from database
        imageRepository.delete(image);

        System.out.println(
                "Image deleted from database: "
                        + imageId
        );
    }

    // =====================================================
    // CHANGE IMAGE
    // =====================================================

    public void changeImage(
            Long imageId,
            MultipartFile newFile
    ) throws Exception {

        // Find existing image
        Image oldImage =
                imageRepository.findById(imageId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Image not found"
                                )
                        );

        // Make sure a new file was provided
        if (newFile == null || newFile.isEmpty()) {
            throw new RuntimeException(
                    "New image file is empty"
            );
        }

        // -------------------------------------------------
        // 1. Delete OLD image from Cloudinary
        // -------------------------------------------------

        deleteFromCloudinary(
                oldImage.getThumbnailUrl()
        );

        // -------------------------------------------------
        // 2. Upload NEW image to Cloudinary
        // -------------------------------------------------

        Map uploadResult =
                cloudinary.uploader()
                        .upload(
                                newFile.getBytes(),
                                ObjectUtils.asMap(
                                        "folder",
                                        "dealhunts/products"
                                )
                        );

        String newImageUrl =
                uploadResult
                        .get("secure_url")
                        .toString();

        // -------------------------------------------------
        // 3. Update existing database record
        // -------------------------------------------------

        oldImage.setThumbnailUrl(
                newImageUrl
        );

        oldImage.setImageStatus(
                "ACTIVE"
        );

        imageRepository.save(oldImage);

        System.out.println(
                "Image changed successfully: "
                        + imageId
        );
    }
}