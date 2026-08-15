package org.example.controller;

import java.util.List;

import org.example.dto.ImageResponse;
import org.example.entity.Image;
import org.example.entity.Product;
import org.example.repository.ImageRepository;
import org.example.repository.ProductRepository;
import org.example.service.ImageUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@RequestMapping("/admin/products")
@CrossOrigin
public class ImageUploadController {

    private final ImageUploadService imageUploadService;
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    public ImageUploadController(
            ImageUploadService imageUploadService,
            ProductRepository productRepository,
            ImageRepository imageRepository
    ) {
        this.imageUploadService = imageUploadService;
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
    }

    // =====================================================
    // UPLOAD NEW IMAGES
    // =====================================================

    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadImages(
            @RequestParam("images")
            MultipartFile[] images,

            @RequestParam("productId")
            Long productId
    ) throws Exception {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Product not found"
                                )
                        );

        imageUploadService.uploadImages(
                images,
                product
        );

        return ResponseEntity.ok(
                "Images uploaded successfully"
        );
    }

    // =====================================================
    // GET PRODUCT IMAGES
    // =====================================================

    @GetMapping("/{productId}/images")
    public ResponseEntity<?> getProductImages(
            @PathVariable Long productId
    ) {

        List<Image> images =
                imageRepository.findByProductId(productId);

        List<ImageResponse> imageResponses =
                images.stream()
                        .map(image ->
                                new ImageResponse(
                                        image.getId(),
                                        image.getThumbnailUrl()
                                )
                        )
                        .toList();

        return ResponseEntity.ok(imageResponses);
    }

    // =====================================================
    // DELETE IMAGE
    // =====================================================

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteImage(
            @PathVariable Long imageId
    ) {

        try {

            imageUploadService.deleteImage(
                    imageId
            );

            return ResponseEntity.ok(
                    "Image deleted successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // CHANGE IMAGE
    // =====================================================

    @PutMapping("/images/{imageId}")
    public ResponseEntity<?> changeImage(
            @PathVariable Long imageId,

            @RequestParam("image")
            MultipartFile image
    ) {

        try {

            imageUploadService.changeImage(
                    imageId,
                    image
            );

            return ResponseEntity.ok(
                    "Image changed successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}