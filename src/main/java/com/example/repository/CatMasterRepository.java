package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.Catmaster;

import java.util.List;
import java.util.Optional;

public interface CatMasterRepository
        extends JpaRepository<Catmaster, Integer> {

    // Main Categories
    List<Catmaster> findBySubcatIdIsNull();

    // Sub Categories
    List<Catmaster> findBySubcatId(String subcatId);

        // Fetch a single category by Cat_Id
        Catmaster findByCatId(String catId);
        
    
}
