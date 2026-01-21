package com.example.repository;

import com.example.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    // Fetch ACTIVE cart of a user
    Optional<Cart> findByUser_IdAndIsActive(Integer userId, Character isActive);
}
