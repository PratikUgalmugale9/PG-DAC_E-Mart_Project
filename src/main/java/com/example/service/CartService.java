package com.example.service;

public interface CartService {

    void addToCart(Integer userId, Integer productId, Integer quantity);

    void removeFromCart(Integer userId, Integer productId);

    void viewCart(Integer userId);
}
