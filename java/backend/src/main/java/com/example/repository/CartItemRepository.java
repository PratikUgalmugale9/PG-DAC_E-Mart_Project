package com.example.repository;

import com.example.entity.Cartitem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.math.BigDecimal;

public interface CartItemRepository extends JpaRepository<Cartitem, Integer> {

    // Find a specific product inside a cart
    Optional<Cartitem> findByCart_IdAndProd_Id(Integer cartId, Integer prodId);

    // Get all items of a cart
    List<Cartitem> findByCart_Id(Integer cartId);

    // (Optional) Find items by price snapshot
    List<Cartitem> findByPriceSnapshot(BigDecimal priceSnapshot);
}
