package com.example.service;

import com.example.entity.*;
import com.example.repository.*;
import com.example.service.CartService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void addToCart(Integer userId, Integer productId, Integer quantity) {

        // 1. Get User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Get ACTIVE cart or create new
        Cart cart = cartRepository
                .findByUser_IdAndIsActive(userId, 'Y')
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUser(user);
                    c.setIsActive('Y');
                    return cartRepository.save(c);
                });

        // 3. Get Product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 4. Check if product already exists in cart
        Cartitem item = cartItemRepository
                .findByCart_IdAndProd_Id(cart.getId(), productId)
                .orElse(null);

        if (item != null) {
            // update quantity
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            // add new item
            Cartitem newItem = new Cartitem();
            newItem.setCart(cart);
            newItem.setProd(product);
            newItem.setQuantity(quantity);
            newItem.setPriceSnapshot(product.getMrpPrice());


            cartItemRepository.save(newItem);
        }
    }

    @Override
    public void removeFromCart(Integer userId, Integer productId) {

        Cart cart = cartRepository
                .findByUser_IdAndIsActive(userId, 'Y')
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Cartitem item = cartItemRepository
                .findByCart_IdAndProd_Id(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        cartItemRepository.delete(item);
    }

    @Override
    public void viewCart(Integer userId) {
        // Later convert to DTO
        Cart cart = cartRepository
                .findByUser_IdAndIsActive(userId, 'Y')
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartItemRepository.findByCart_Id(cart.getId())
                .forEach(i ->
                        System.out.println(
                                i.getProd().getProdName() +
                                " x " + i.getQuantity() +
                                " = " + i.getPriceSnapshot()
                        )
                );
    }
}
