package com.example.dto;

import com.example.entity.Catmaster;
import com.example.entity.Product;
import java.util.List;

public class CategoryBrowseResponse {

    private boolean hasSubCategories;
    private List<Catmaster> subCategories;
    private List<Product> product;
    public void setHasSubCategories(boolean b) {

        this.hasSubCategories = b;

    }
    public List<Catmaster> getSubCategories() {
        return subCategories;
    }
    public void setSubCategories(List<Catmaster> subCategories) {
        this.subCategories = subCategories;
    }
    public List<Product> getProduct() {
        return product;
    }
    public void setProduct(List<Product> product) {
        this.product = product;
    }
    public boolean isHasSubCategories() {
        return hasSubCategories;
    }

}
