package org.example.controller;

import org.example.entity.Product;
import org.example.repository.ProductRepository;
import org.example.service.ImageUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/admin/products")
@CrossOrigin
public class ImageUploadController {


    private final ImageUploadService imageUploadService;
    private final ProductRepository productRepository;


    public ImageUploadController(
            ImageUploadService imageUploadService,
            ProductRepository productRepository
    ){
        this.imageUploadService = imageUploadService;
        this.productRepository = productRepository;
    }



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
                    () -> new RuntimeException("Product not found")
                );


        imageUploadService.uploadImages(
                images,
                product
        );


        return ResponseEntity.ok(
                "Images uploaded successfully"
        );
    }
}