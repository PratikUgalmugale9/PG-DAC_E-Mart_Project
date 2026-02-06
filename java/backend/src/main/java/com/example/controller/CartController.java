package com.example.controller;

import com.example.dto.CartResponseDTO;
import com.example.entity.Cart;
import com.example.entity.User;
import com.example.repository.CartRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

        @Autowired
        private CartRepository cartRepository;

        @Autowired
        private UserRepository userRepository;

        // CREATE cart for logged-in user
        @PostMapping("/create")
        public CartResponseDTO createCart(Authentication authentication) {

                String email = authentication.getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (cartRepository.findByUser_Email(email).isPresent()) {
                        return getMyCart(authentication);
                }

                Cart cart = new Cart();
                cart.setUser(user);
                cart.setIsActive('Y');

                return mapToCartResponseDTO(cartRepository.save(cart));
        }

        // GET logged-in user's cart
        @GetMapping("/my")
        public CartResponseDTO getMyCart(Authentication authentication) {

                String email = authentication.getName();

                Cart cart = cartRepository.findByUser_Email(email)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                return mapToCartResponseDTO(cart);
        }

        // UPDATE logged-in user's cart
        @PutMapping("/update")
        public CartResponseDTO updateMyCart(
                        Authentication authentication,
                        @RequestBody Cart updatedCart) {

                String email = authentication.getName();

                Cart cart = cartRepository.findByUser_Email(email)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                cart.setIsActive(updatedCart.getIsActive());

                return mapToCartResponseDTO(cartRepository.save(cart));
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

        private CartResponseDTO mapToCartResponseDTO(Cart cart) {
                List<com.example.dto.CartItemResponseDTO> itemDTOs = cart.getCartItems().stream()
                                .map(item -> {
                                        com.example.dto.CartItemResponseDTO dto = new com.example.dto.CartItemResponseDTO();
                                        dto.setId(item.getId());
                                        dto.setCartItemId(item.getId());
                                        dto.setCartId(cart.getId());
                                        dto.setProductId(item.getProd().getId());
                                        dto.setProductName(item.getProd().getProdName());
                                        dto.setProdImagePath(item.getProd().getProdImagePath());
                                        dto.setQuantity(item.getQuantity());
                                        dto.setPriceSnapshot(item.getPriceSnapshot());
                                        dto.setMrpPrice(item.getProd().getMrpPrice());
                                        dto.setCardholderPrice(item.getProd().getCardholderPrice());
                                        dto.setPointsToBeRedeem(item.getProd().getPointsToBeRedeem());
                                        dto.setPriceType(item.getPriceType());
                                        dto.setPointsUsed(item.getPointsUsed());

                                        BigDecimal price = item.getPriceSnapshot() != null ? item.getPriceSnapshot()
                                                        : BigDecimal.ZERO;
                                        dto.setTotalPrice(price.multiply(BigDecimal.valueOf(item.getQuantity())));
                                        return dto;
                                }).collect(java.util.stream.Collectors.toList());

                BigDecimal grandTotal = itemDTOs.stream()
                                .map(com.example.dto.CartItemResponseDTO::getTotalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                int totalPointsUsed = cart.getCartItems().stream()
                                .mapToInt(i -> i.getPointsUsed() != null ? i.getPointsUsed() : 0)
                                .sum();

                return new CartResponseDTO(cart.getId(), cart.getIsActive(), itemDTOs, grandTotal, totalPointsUsed);
        }
}