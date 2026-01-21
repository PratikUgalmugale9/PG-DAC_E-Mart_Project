package com.example.controller;

import org.springframework.web.bind.annotation.*;

import com.example.entity.Catmaster;
import com.example.entity.Product;
import com.example.service.CatalogServiceImpl;

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
//    @GetMapping("/categories/{catId}")
//    public Object subCategories(@PathVariable String catId) {
//        return service.handleCategorySelection(catId);
//    }

    @GetMapping("/categories/{catId}")
    public List<Catmaster> subCategories(@PathVariable String catId) {
        return service.getSubCategories(catId);
    }

  //  @GetMapping("/products/{catMasterId}")
//    public List<Product> products(@PathVariable Integer catMasterId) {
//        return service.getProducts(catMasterId);
//    }
}
