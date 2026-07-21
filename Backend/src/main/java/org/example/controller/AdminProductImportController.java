package org.example.controller;

import org.example.service.AdminProductImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/import")
public class AdminProductImportController {

    @Autowired
    private AdminProductImportService adminProductImportService;

    @PostMapping("/products")
    public ResponseEntity<?> importProducts(
            @RequestParam("file") MultipartFile file
    ){

        if(file.isEmpty()){
            return ResponseEntity
                    .badRequest()
                    .body("CSV file is empty");
        }

        adminProductImportService.importProducts(file);

        return ResponseEntity.ok(
                "CSV received successfully"
        );
    }

}