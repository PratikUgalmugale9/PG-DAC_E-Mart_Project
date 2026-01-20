package com.example.controller;

import com.example.entity.Cart;
import com.example.entity.User;
import com.example.repository.CartRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    // ---------------- CREATE CART ----------------
    @PostMapping("/create/{userId}")
    public Cart createCart(@PathVariable Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setIsActive('Y');

        return cartRepository.save(cart);
    }

    // ---------------- GET CART BY ID ----------------
    @GetMapping("/{cartId}")
    public Cart getCartById(@PathVariable Integer cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }

    // ---------------- GET ALL CARTS ----------------
    @GetMapping("/all")
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    // ---------------- UPDATE CART ----------------
    @PutMapping("/update/{cartId}")
    public Cart updateCart(@PathVariable Integer cartId,
                           @RequestBody Cart updatedCart) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.setIsActive(updatedCart.getIsActive());

        return cartRepository.save(cart);
    }

    // ---------------- DELETE CART ----------------
    @DeleteMapping("/delete/{cartId}")
    public String deleteCart(@PathVariable Integer cartId) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartRepository.delete(cart);
        return "Cart deleted successfully";
    }
}