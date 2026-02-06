package com.example.controller;

import com.example.entity.Product;
import com.example.service.ExcelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final ExcelService excelService;

    public AdminController(ExcelService excelService) {
        this.excelService = excelService;
    }

    @PostMapping("/products/upload")
    public ResponseEntity<?> uploadProducts(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload an Excel file.");
        }

        try {
            List<Product> products = excelService.uploadProducts(file);
            return ResponseEntity.ok(Map.of(
                    "message", "Successfully uploaded " + products.size() + " products.",
                    "count", products.size()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing Excel file: " + e.getMessage());
        }
    }
}
