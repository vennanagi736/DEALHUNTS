package org.example.service;

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
    ){
        this.cloudinary = cloudinary;
        this.imageRepository = imageRepository;
    }


    public void uploadImages(
            MultipartFile[] files,
            Product product
    ) throws Exception {

        System.out.println("Product id = "+product.getId());


        for(MultipartFile file : files){
            System.out.println("file:"+file.getOriginalFilename());


            Map uploadResult =
                    cloudinary.uploader()
                    .upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                            "folder",
                            "dealhunts/products"
                        )
                    );
            System.out.println("url:"+uploadResult.get("secure_url"));

            Image image = new Image();
            image.setProduct(product);
            image.setThumbnailUrl(
                uploadResult.get("secure_url").toString()
            );
            image.setImageStatus("ACTIVE");
            imageRepository.save(image);
            System.out.println("Image saved");
        }
    }
}