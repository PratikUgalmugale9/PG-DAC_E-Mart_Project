package com.example.service;

import com.example.dto.CategoryBrowseResponse;
import com.example.entity.Catmaster;
import com.example.entity.Product;
import com.example.repository.CatMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogServiceImpl implements CatalogService {

    private final CatMasterRepository catRepo;
    private final ProductService productService;

    public CatalogServiceImpl(CatMasterRepository catRepo,
            ProductService productService) {
        this.catRepo = catRepo;
        this.productService = productService;
    }

    // 1️⃣ Main categories (parent categories)
    @Override
    public List<Catmaster> getMainCategories() {
        return catRepo.findBySubcatIdIsNull();
    }

    // 2️⃣ Subcategories of a category
    @Override
    public List<Catmaster> getSubCategories(String catId) {
        return catRepo.findBySubcatId(catId);
    }

    // 3️⃣ Products of a category (leaf)
    @Override
    public List<Product> getProductsByCategory(Integer catMasterId) {
        return productService.getProductsByCategory(catMasterId);
    }

    // 4️⃣ Browse category (navigation + listing)
    @Override
    public CategoryBrowseResponse browseByCategory(String catId) {

        CategoryBrowseResponse response = new CategoryBrowseResponse();

        // Find category by Cat_Id
        Catmaster category = catRepo.findByCatId(catId);
        if (category == null) {
            throw new RuntimeException("Category not found: " + catId);
        }

        // 🔥 Check if subcategories exist
        List<Catmaster> subCategories = catRepo.findBySubcatId(catId);

        // Case 1: Subcategories exist → return navigation
        if (!subCategories.isEmpty()) {
            response.setHasSubCategories(true);
            response.setSubCategories(subCategories);
            response.setProducts(null); // ✅ FIXED
            return response;
        }

        // Case 2: Leaf category → return products
        List<Product> products = productService.getProductsByCategory(category.getId());

        response.setHasSubCategories(false);
        response.setSubCategories(null);
        response.setProducts(products); // ✅ FIXED

        return response;
    }
}
