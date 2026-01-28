package com.example.controller;

import com.example.dto.CartItemRequestDTO;
import com.example.dto.CartItemResponseDTO;
import com.example.entity.Cart;
import com.example.entity.Cartitem;
import com.example.entity.Product;
import com.example.entity.User;
import com.example.repository.CartItemRepository;
import com.example.repository.CartRepository;
import com.example.repository.ProductRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cartitem")
public class CartItemController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // @PostMapping("/add")
    // public CartItemResponseDTO addCartItem(@RequestBody CartItemRequestDTO dto) {
    //
    // if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
    // throw new IllegalArgumentException("Quantity must be greater than 0");
    // }
    //
    // Cart cart = cartRepository.findById(dto.getCartId())
    // .orElseThrow(() -> new IllegalArgumentException("Cart not found!!!"));
    //
    // Product product = productRepository.findById(dto.getProductId())
    // .orElseThrow(() ->
    // new ResponseStatusException(
    // HttpStatus.NOT_FOUND,
    // "Product not found!!"
    // )
    // );
    //
    // // 🔑 CHECK IF PRODUCT ALREADY EXISTS IN CART
    // Cartitem cartItem = cartItemRepository
    // .findByCartIdAndProdId(cart.getId(), product.getId())
    // .orElse(null);
    //
    // if (cartItem != null) {
    // // ✅ DUPLICATE PRODUCT → INCREASE QUANTITY
    // cartItem.setQuantity(cartItem.getQuantity() + dto.getQuantity());
    // } else {
    // // ✅ NEW PRODUCT
    // cartItem = new Cartitem();
    // cartItem.setCart(cart);
    // cartItem.setProd(product);
    // cartItem.setQuantity(dto.getQuantity());
    // cartItem.setPriceSnapshot(product.getMrpPrice());
    // }
    //
    // Cartitem saved = cartItemRepository.save(cartItem);
    // return mapToResponseDTO(saved);
    // }

    // new
    @PostMapping("/add")
    public CartItemResponseDTO addCartItem(
            @RequestBody CartItemRequestDTO dto,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Cart cart = user.getCart();
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setIsActive('Y');
            user.setCart(cart);
            cart = cartRepository.save(cart);
        }

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cartitem cartItem = cartItemRepository
                .findByCartIdAndProdId(cart.getId(), product.getId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + dto.getQuantity());
        } else {
            cartItem = new Cartitem();
            cartItem.setCart(cart);
            cartItem.setProd(product);
            cartItem.setQuantity(dto.getQuantity());
            cartItem.setPriceSnapshot(product.getMrpPrice());
        }

        return mapToResponseDTO(cartItemRepository.save(cartItem));
    }

    // new
    @GetMapping("/my")
    public List<CartItemResponseDTO> getMyCartItems(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Cart cart = user.getCart();
        if (cart == null) {
            return List.of();
        }

        return cartItemRepository.findByCart_Id(cart.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // Secure update
    @PutMapping("/update/{id}")
    public CartItemResponseDTO updateCartItem(
            @PathVariable Integer id,
            @RequestBody CartItemRequestDTO dto,
            Authentication authentication) {
        String email = authentication.getName();
        Cartitem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if (!cartItem.getCart().getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this cart item");
        }

        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        cartItem.setQuantity(dto.getQuantity());

        return mapToResponseDTO(cartItemRepository.save(cartItem));
    }

    // Secure delete
    @DeleteMapping("/delete/{id}")
    public String deleteCartItem(
            @PathVariable Integer id,
            Authentication authentication) {
        String email = authentication.getName();
        Cartitem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if (!cartItem.getCart().getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this cart item");
        }

        cartItemRepository.delete(cartItem);
        return "CartItem deleted successfully";
    }

    private CartItemResponseDTO mapToResponseDTO(Cartitem item) {
        CartItemResponseDTO dto = new CartItemResponseDTO();
        dto.setCartItemId(item.getId());
        dto.setCartId(item.getCart().getId());
        dto.setProductId(item.getProd().getId());
        dto.setProductName(item.getProd().getProdName());
        dto.setProdImagePath(item.getProd().getProdImagePath());
        dto.setQuantity(item.getQuantity());
        dto.setPriceSnapshot(item.getPriceSnapshot());
        dto.setMrpPrice(item.getProd().getMrpPrice());
        dto.setCardholderPrice(item.getProd().getCardholderPrice());
        dto.setPointsToBeRedeem(item.getProd().getPointsToBeRedeem());

        BigDecimal total = item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
        dto.setTotalPrice(total);

        return dto;
    }
}
