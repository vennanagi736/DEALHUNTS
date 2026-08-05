package org.example.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;


    public Map<String, Object> uploadImage(MultipartFile file) throws IOException {


    Map<String, Object> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.emptyMap()
    );

    System.out.println(uploadResult);


    String originalUrl = uploadResult
            .get("secure_url")
            .toString();


    String thumbnailUrl = originalUrl.replace(
            "/upload/",
            "/upload/w_300,h_300,c_fill/"
    );


    uploadResult.put(
            "thumbnail_url",
            thumbnailUrl
    );


    return uploadResult;
    }
}