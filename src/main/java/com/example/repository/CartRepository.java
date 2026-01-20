package com.example.repository;

import com.example.entity.Cart;
import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findByUserAndIsActive(User user, Character isActive);
}
