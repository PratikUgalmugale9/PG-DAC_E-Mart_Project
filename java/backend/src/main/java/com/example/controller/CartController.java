package com.example.controller;

import com.example.entity.Cart;
import com.example.entity.User;
import com.example.repository.CartRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    // CREATE cart for logged-in user
    @PostMapping("/create")
    public Cart createCart(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (cartRepository.findByUser_Email(email).isPresent()) {
            throw new RuntimeException("Cart already exists");
        }

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setIsActive('Y');

        return cartRepository.save(cart);
    }

    // GET logged-in user's cart
    @GetMapping("/my")
    public Cart getMyCart(Authentication authentication) {

        String email = authentication.getName();

        return cartRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }

    // UPDATE logged-in user's cart
    @PutMapping("/update")
    public Cart updateMyCart(
            Authentication authentication,
            @RequestBody Cart updatedCart) {

        String email = authentication.getName();

        Cart cart = cartRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.setIsActive(updatedCart.getIsActive());

        return cartRepository.save(cart);
    }

    // DELETE logged-in user's cart
    @DeleteMapping("/delete")
    public String deleteMyCart(Authentication authentication) {

        String email = authentication.getName();

        Cart cart = cartRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartRepository.delete(cart);
        return "Cart deleted successfully";
    }
}