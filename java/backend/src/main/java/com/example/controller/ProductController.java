package com.example.controller;

import com.example.entity.Product;
import com.example.repository.ProductRepository;
import com.example.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // 🔥 React support
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    
    private ProductRepository productRepository;
    
    public ProductController(ProductService productService,ProductRepository productRepository) {
        this.productService = productService;
        this.productRepository=productRepository;
    }

    // CREATE or UPDATE product
    @PostMapping
    public ResponseEntity<Product> saveProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    // GET all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // GET product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // DELETE product by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }

    // 🔥 GET products by category (used by CatalogService also)
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @PathVariable Integer categoryId) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(categoryId));
    }
    
    
    //for search
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String q) {
        return productRepository
            .findByProdNameContainingIgnoreCase(q);
    }

}