package com.example.service;

import com.example.entity.Product;
import java.util.List;

public interface ProductService {

    Product saveProduct(Product product);

    List<Product> getAllProducts();

    Product getProductById(Integer id);

    void deleteProduct(Integer id);

    // 🔥 THIS METHOD MUST EXIST
    List<Product> getProductsByCategory(Integer categoryId);
}
