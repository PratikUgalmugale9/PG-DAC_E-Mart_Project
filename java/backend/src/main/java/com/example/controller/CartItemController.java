package com.example.controller;

import com.example.dto.CartItemRequestDTO;
import com.example.dto.CartItemResponseDTO;
import com.example.entity.Cart;
import com.example.entity.Cartitem;
import com.example.entity.Product;
import com.example.entity.User;
import com.example.repository.CartItemRepository;
import com.example.repository.CartRepository;
import com.example.repository.LoyaltycardRepository;
import com.example.repository.ProductRepository;
import com.example.repository.UserRepository;
import com.example.service.CartService;
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
    
    @Autowired
    private LoyaltycardRepository loyaltycardRepository;
    
    @Autowired
    private CartService cartService;

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

        // ✅ CRITICAL FIX: Delegate to CartService which has proper validation
        // This ensures points validation, price type validation, etc.
        cartService.addToCart(
            user.getId(), 
            dto.getProductId(), 
            dto.getQuantity(), 
            dto.getPriceType()
        );
        
        // Fetch the updated cart item to return
        Cart cart = user.getCart();
        if (cart == null) {
            throw new RuntimeException("Cart not found after adding item");
        }
        
        Cartitem cartItem = cartItemRepository
                .findByCartIdAndProdId(cart.getId(), dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Cart item not found after adding"));

        return mapToResponseDTO(cartItem);
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

        List<Cartitem> cartItems = cartItemRepository.findByCart_Id(cart.getId());
        
        // ✅ VALIDATE POINTS BALANCE (detect legacy invalid cart items)
        int totalPointsUsed = cartItems.stream()
                .mapToInt(ci -> ci.getPointsUsed() != null ? ci.getPointsUsed() : 0)
                .sum();
        
        if (totalPointsUsed > 0) {
            // Check if user has loyalty card and sufficient points
            com.example.entity.Loyaltycard loyaltyCard = loyaltycardRepository.findByUser_Id(user.getId());
            int availablePoints = (loyaltyCard != null && loyaltyCard.getPointsBalance() != null) 
                ? loyaltyCard.getPointsBalance() : 0;
            
            if (totalPointsUsed > availablePoints) {
                // Log warning about invalid cart state
                System.err.println("⚠️ WARNING: Cart has invalid points usage!");
                System.err.println("   User: " + email);
                System.err.println("   Points Used: " + totalPointsUsed);
                System.err.println("   Points Available: " + availablePoints);
                System.err.println("   Please remove items from cart to proceed with checkout.");
            }
        }

        return cartItems.stream()
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

        // ✅ VALIDATE POINTS if this is a POINTS item
        if ("POINTS".equals(cartItem.getPriceType()) || 
            ("LOYALTY".equals(cartItem.getPriceType()) && cartItem.getPointsUsed() != null && cartItem.getPointsUsed() > 0)) {
            
            Product product = cartItem.getProd();
            int pointsPerItem = product.getPointsToBeRedeem() != null ? product.getPointsToBeRedeem() : 0;
            int newTotalPoints = pointsPerItem * dto.getQuantity();
            
            // Get user's loyalty card
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            com.example.entity.Loyaltycard loyaltyCard = loyaltycardRepository.findByUser_Id(user.getId());
            
            if (loyaltyCard == null || loyaltyCard.getIsActive() != 'Y') {
                throw new RuntimeException("Active loyalty card required for points redemption");
            }
            
            // Calculate points used by other items in cart (exclude current item)
            int otherItemsPoints = cartItemRepository.findByCart_Id(cartItem.getCart().getId()).stream()
                    .filter(ci -> !ci.getId().equals(cartItem.getId()))
                    .mapToInt(ci -> ci.getPointsUsed() != null ? ci.getPointsUsed() : 0)
                    .sum();
            
            int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0) - otherItemsPoints;
            
            if (newTotalPoints > availablePoints) {
                throw new RuntimeException(String.format(
                    "Insufficient loyalty points. Required: %d, Available: %d",
                    newTotalPoints, availablePoints
                ));
            }
            
            // Update points used
            cartItem.setPointsUsed(newTotalPoints);
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
        dto.setPriceType(item.getPriceType());  // ✅ Add priceType
        dto.setPointsUsed(item.getPointsUsed()); // ✅ Add pointsUsed

        BigDecimal total = item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
        dto.setTotalPrice(total);

        return dto;
    }
}