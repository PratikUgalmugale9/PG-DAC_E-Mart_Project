package com.example.service;

public interface CartService {

    void addToCart(Integer userId, Integer productId, Integer quantity, String priceType);

    void removeFromCart(Integer userId, Integer productId);

    void viewCart(Integer userId);
}
