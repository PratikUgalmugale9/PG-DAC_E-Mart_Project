package com.example.service;

import org.springframework.stereotype.Service;

import com.example.entity.Catmaster;
import com.example.entity.Product;
import com.example.repository.CatMasterRepository;
//import com.example.repository.ProductRepository;
import com.example.repository.ProductRepository;

import java.util.List;

@Service
public class CatalogServiceImpl implements CatalogService {

    private final CatMasterRepository catRepo;
    private  ProductService prodRepo;

    public CatalogServiceImpl(CatMasterRepository catRepo,
    		ProductService prodRepo
    		) {
        this.catRepo = catRepo;
        this.prodRepo = prodRepo;
    }

    public List<Catmaster> getMainCategories() {
        return catRepo.findBySubcatIdIsNull();
    }

    
//    public Object handleCategorySelection(String catId) {
//    
//      Catmaster category = catRepo.findByCatId(catId);
//        //  .orElseThrow(() -> new RuntimeException("Category not found"));
//
//      // CASE 1: FLAG = Y → SHOW DETAILS / PRODUCTS
//      if (category.getFlag() == 'Y') {
//      // Example: return products
//      return prodRepo.getProductById(category.getId());
//      }
//
//  // CASE 2: FLAG = N → FETCH SUBCATEGORIES
//  return catRepo.findBySubcatId(catId);
//}

    public List<Catmaster> getSubCategories(String catId) {
        return catRepo.findBySubcatId(catId);
    }

	@Override
	public List<Product> getProducts(Integer catMasterId) {
		// TODO Auto-generated method stub
		return null;
	}

//    public List<Product> getProducts(Integer catMasterId) {
//        return prodRepo.findByCategory_CatMasterId(catMasterId);
//    }
}

