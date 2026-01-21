package com.example.service;

import com.example.entity.Catmaster;
import com.example.entity.Product;

import java.util.List;

public interface CatalogService {

    List<Catmaster> getMainCategories();

    List<Catmaster> getSubCategories(String catId);

    List<Product> getProducts(Integer catMasterId);
}

