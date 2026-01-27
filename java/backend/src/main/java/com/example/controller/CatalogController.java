package com.example.controller;

import com.example.dto.CategoryBrowseResponse;
import org.springframework.web.bind.annotation.*;

import com.example.entity.Catmaster;
import com.example.entity.Product;
import com.example.service.CatalogServiceImpl;

import java.util.List;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogServiceImpl service;

    public CatalogController(CatalogServiceImpl service) {
        this.service = service;
    }



    @GetMapping("/categories")
    public List<Catmaster> mainCategories() {
        return service.getMainCategories();
    }

    @GetMapping("/categories/{catId}")
    public CategoryBrowseResponse subCategories(@PathVariable String catId) {
        return service.browseByCategory(catId);
    }
}