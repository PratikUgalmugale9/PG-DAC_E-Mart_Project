package com.example.controller;

import com.example.dto.CartItemRequestDTO;
import com.example.dto.CartItemResponseDTO;
import com.example.entity.Cart;
import com.example.entity.Cartitem;
import com.example.entity.Product;
import com.example.entity.User;
import com.example.entity.Loyaltycard;
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

    @Autowired
    private com.example.repository.LoyaltycardRepository loyaltycardRepository;

    private Loyaltycard getActiveLoyaltyCard(Integer userId) {
        Loyaltycard card = loyaltycardRepository.findByUser_Id(userId);
        if (card != null && (card.getIsActive() == 'Y' || card.getIsActive() == 'y')) {
            return card;
        }
        return null;
    }

    private int getUsedPointsInCart(Integer cartId) {
        return cartItemRepository.findByCart_Id(cartId).stream()
                .mapToInt(ci -> ci.getPointsUsed() != null ? ci.getPointsUsed() : 0)
                .sum();
    }

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

        // Match .NET Logic
        BigDecimal priceToUse;
        int pointsToUse = 0;
        String priceType = dto.getPriceType() != null ? dto.getPriceType().toUpperCase() : "MRP";

        if (priceType.equals("MRP")) {
            priceToUse = product.getMrpPrice();
        } else if (priceType.equals("LOYALTY")) {
            Loyaltycard loyaltyCard = getActiveLoyaltyCard(user.getId());
            if (loyaltyCard == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Loyalty pricing requires an active loyalty card");
            }
            if (product.getCardholderPrice() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "This product does not have a cardholder price");
            }
            priceToUse = product.getCardholderPrice();

            if (product.getPointsToBeRedeem() != null && product.getPointsToBeRedeem() > 0) {
                pointsToUse = product.getPointsToBeRedeem() * dto.getQuantity();
                int usedInCart = getUsedPointsInCart(cart.getId());
                int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0)
                        - usedInCart;

                if (pointsToUse > availablePoints) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient loyalty points. Required: "
                            + pointsToUse + ", Available: " + availablePoints);
                }
            }
        } else if (priceType.equals("POINTS")) {
            Loyaltycard loyaltyCard = getActiveLoyaltyCard(user.getId());
            if (loyaltyCard == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Points redemption requires an active loyalty card");
            }
            if (product.getPointsToBeRedeem() == null || product.getPointsToBeRedeem() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "This product cannot be purchased with points");
            }

            pointsToUse = product.getPointsToBeRedeem() * dto.getQuantity();
            int usedInCart = getUsedPointsInCart(cart.getId());
            int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0)
                    - usedInCart;

            if (pointsToUse > availablePoints) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Insufficient loyalty points. Required: " + pointsToUse + ", Available: " + availablePoints);
            }
            priceToUse = product.getMrpPrice();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid price type: " + priceType);
        }

        Cartitem cartItem = cartItemRepository
                .findByCartIdAndProdId(cart.getId(), product.getId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + dto.getQuantity());
            cartItem.setPriceSnapshot(priceToUse);
            cartItem.setPriceType(priceType);
            if (priceType.equals("POINTS") || (priceType.equals("LOYALTY") && product.getPointsToBeRedeem() != null
                    && product.getPointsToBeRedeem() > 0)) {
                cartItem.setPointsUsed(product.getPointsToBeRedeem() * cartItem.getQuantity());
            } else {
                cartItem.setPointsUsed(0);
            }
        } else {
            cartItem = new Cartitem();
            cartItem.setCart(cart);
            cartItem.setProd(product);
            cartItem.setQuantity(dto.getQuantity());
            cartItem.setPriceSnapshot(priceToUse);
            cartItem.setPriceType(priceType);
            cartItem.setPointsUsed(pointsToUse);
        }

        return mapToResponseDTO(cartItemRepository.save(cartItem));
    }

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

        int quantity = dto.getQuantity();
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (cartItem.getPriceType().equals("POINTS") ||
                (cartItem.getPriceType().equals("LOYALTY") && cartItem.getProd().getPointsToBeRedeem() != null
                        && cartItem.getProd().getPointsToBeRedeem() > 0)) {

            User user = cartItem.getCart().getUser();
            Loyaltycard loyaltyCard = getActiveLoyaltyCard(user.getId());
            if (loyaltyCard != null) {
                int newPointsRequired = cartItem.getProd().getPointsToBeRedeem() * quantity;
                int currentUsedPoints = getUsedPointsInCart(cartItem.getCart().getId());
                int pointsFromThisItem = cartItem.getPointsUsed() != null ? cartItem.getPointsUsed() : 0;
                int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0)
                        - currentUsedPoints + pointsFromThisItem;

                if (newPointsRequired > availablePoints) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Insufficient loyalty points for this quantity.");
                }
                cartItem.setPointsUsed(newPointsRequired);
            }
        }

        cartItem.setQuantity(quantity);
        return mapToResponseDTO(cartItemRepository.save(cartItem));
    }

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
        dto.setId(item.getId());
        dto.setCartItemId(item.getId());
        dto.setCartId(item.getCart().getId());
        dto.setProductId(item.getProd().getId());
        dto.setProductName(item.getProd().getProdName());
        dto.setProdImagePath(item.getProd().getProdImagePath());
        dto.setQuantity(item.getQuantity());

        // Defensive null health for prices to prevent NaN in frontend
        BigDecimal price = item.getPriceSnapshot() != null ? item.getPriceSnapshot() : item.getProd().getMrpPrice();
        if (price == null)
            price = BigDecimal.ZERO;

        dto.setPriceSnapshot(price);
        dto.setMrpPrice(item.getProd().getMrpPrice() != null ? item.getProd().getMrpPrice() : BigDecimal.ZERO);
        dto.setCardholderPrice(item.getProd().getCardholderPrice());
        dto.setPointsToBeRedeem(item.getProd().getPointsToBeRedeem());
        dto.setPriceType(item.getPriceType());
        dto.setPointsUsed(item.getPointsUsed() != null ? item.getPointsUsed() : 0);

        dto.setTotalPrice(price.multiply(BigDecimal.valueOf(item.getQuantity())));

        return dto;
    }
}