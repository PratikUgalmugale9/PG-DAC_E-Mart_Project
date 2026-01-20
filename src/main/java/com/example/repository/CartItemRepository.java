package com.example.repository;

import com.example.entity.Cart;
import com.example.entity.Cartitem;
import com.example.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<Cartitem, Integer> {

    Optional<Cartitem> findByCartAndProd(Cart cart, Product prod);
}
