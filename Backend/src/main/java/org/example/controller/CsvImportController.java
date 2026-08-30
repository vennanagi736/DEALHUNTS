package org.example.controller;

import java.util.HashMap;
import java.util.Map;

import org.example.service.CsvImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/products/csv")
@CrossOrigin(origins = "http://localhost:5173")
public class CsvImportController {

    private final CsvImportService csvImportService;

    public CsvImportController(
            CsvImportService csvImportService
    ) {
        this.csvImportService =
                csvImportService;
    }

    // ============================================================
    // IMPORT PRODUCTS FROM CSV
    // ============================================================

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importCsv(
            @RequestParam("file") MultipartFile file
    ) {

        int importedCount =
                csvImportService.importProducts(file);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "CSV imported successfully"
        );

        response.put(
                "importedCount",
                importedCount
        );

        return ResponseEntity.ok(response);
    }
}