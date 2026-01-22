package com.example.controller;

import com.example.dto.CartItemRequestDTO;
import com.example.dto.CartItemResponseDTO;
import com.example.entity.Cart;
import com.example.entity.Cartitem;
import com.example.entity.Product;
import com.example.repository.CartItemRepository;
import com.example.repository.CartRepository;
import com.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    
    @PostMapping("/add")
    public CartItemResponseDTO addCartItem(@RequestBody CartItemRequestDTO dto) {

        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findById(dto.getCartId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cartitem cartItem = new Cartitem();
        cartItem.setCart(cart);
        cartItem.setProd(product);
        cartItem.setQuantity(dto.getQuantity());
        cartItem.setPriceSnapshot(product.getMrpPrice());

        Cartitem saved = cartItemRepository.save(cartItem);

        return mapToResponseDTO(saved);
    }

    
    @GetMapping("/cart/{cartId}")
    public List<CartItemResponseDTO> getItemsByCart(@PathVariable Integer cartId) {

        return cartItemRepository.findByCart_Id(cartId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    @PutMapping("/update/{id}")
    public CartItemResponseDTO updateCartItem(
            @PathVariable Integer id,
            @RequestBody CartItemRequestDTO dto) {

        Cartitem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        cartItem.setQuantity(dto.getQuantity());

        return mapToResponseDTO(cartItemRepository.save(cartItem));
    }

   
    @DeleteMapping("/delete/{id}")
    public String deleteCartItem(@PathVariable Integer id) {

        Cartitem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        cartItemRepository.delete(cartItem);
        return "CartItem deleted successfully";
    }

    
    private CartItemResponseDTO mapToResponseDTO(Cartitem item) {

        CartItemResponseDTO dto = new CartItemResponseDTO();
        dto.setCartItemId(item.getId());
        dto.setCartId(item.getCart().getId());
        dto.setProductId(item.getProd().getId());
        dto.setProductName(item.getProd().getProdName());
        dto.setQuantity(item.getQuantity());
        dto.setPriceSnapshot(item.getPriceSnapshot());

        BigDecimal total =
                item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
        dto.setTotalPrice(total);

        return dto;
    }
}
