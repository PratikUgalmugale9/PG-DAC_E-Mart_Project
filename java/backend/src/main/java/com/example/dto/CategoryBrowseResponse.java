package com.example.dto;

import com.example.entity.Catmaster;
import com.example.entity.Product;
import java.util.List;

public class CategoryBrowseResponse {

    private boolean hasSubCategories;
    private List<Catmaster> subCategories;
    private List<Product> products;

    // --- getters & setters ---

    public boolean isHasSubCategories() {
        return hasSubCategories;
    }

    public void setHasSubCategories(boolean hasSubCategories) {
        this.hasSubCategories = hasSubCategories;
    }

    public List<Catmaster> getSubCategories() {
        return subCategories;
    }

    public void setSubCategories(List<Catmaster> subCategories) {
        this.subCategories = subCategories;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}
