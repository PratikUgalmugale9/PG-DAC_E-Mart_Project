package com.example.service;

import com.example.dto.CategoryBrowseResponse;
import com.example.entity.Catmaster;
import com.example.entity.Product;

import java.util.List;

public interface CatalogService {

    // 1️⃣ Fetch all main (parent) categories
    List<Catmaster> getMainCategories();

    // 2️⃣ Fetch subcategories of a given category (by Cat_Id)
    List<Catmaster> getSubCategories(String catId);

    // 3️⃣ Fetch products of a leaf category (by Catmaster primary key)
    List<Product> getProductsByCategory(Integer catMasterId);

    // 4️⃣ Smart browse API: returns subcategories OR products depending on node
    CategoryBrowseResponse browseByCategory(String catId);
}
