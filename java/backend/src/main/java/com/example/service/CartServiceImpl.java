package com.example.service;

import com.example.entity.*;
import com.example.exception.GlobalExceptionHandler;
import com.example.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

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

    @Autowired
    private LoyaltycardRepository loyaltycardRepository;

    /**
     * Gets the user's active loyalty card if they have one
     */
    private Loyaltycard getActiveLoyaltyCard(Integer userId) {
        Loyaltycard card = loyaltycardRepository.findByUser_Id(userId);
        if (card != null && (card.getIsActive() == 'Y' || card.getIsActive() == 'y')) {
            return card;
        }
        return null;
    }

    /**
     * Gets total points used in the current cart
     */
    private int getUsedPointsInCart(Integer cartId) {
        return cartItemRepository.findByCart_Id(cartId).stream()
                .mapToInt(ci -> ci.getPointsUsed() != null ? ci.getPointsUsed() : 0)
                .sum();
    }

    @Override
    @Transactional
    public void addToCart(Integer userId, Integer productId, Integer quantity, String priceType) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        // Default to MRP if not specified
        if (priceType == null || priceType.trim().isEmpty()) {
            priceType = "MRP";
        }
        priceType = priceType.toUpperCase();

        // 1. Fetch User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Get or create Cart (ONE cart per user)
        Cart cart = user.getCart();
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setIsActive('Y');
            user.setCart(cart);
            cartRepository.save(cart);
        }

        // 3. Fetch Product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 4. Check if product already exists in cart (needed for points validation)
        Optional<Cartitem> existingItem =
                cartItemRepository.findByCartIdAndProdId(cart.getId(), productId);
        int currentItemPoints = existingItem.isPresent() ? (existingItem.get().getPointsUsed() != null ? existingItem.get().getPointsUsed() : 0) : 0;

        // 5. Validate price type and determine price
        BigDecimal priceToUse;
        int pointsToUse = 0;

        if ("MRP".equals(priceType)) {
            // MRP is always available
            priceToUse = product.getMrpPrice() != null ? product.getMrpPrice() : BigDecimal.ZERO;
        } 
        else if ("LOYALTY".equals(priceType)) {
            // LOYALTY requires active loyalty card and cardholder price
            Loyaltycard loyaltyCard = getActiveLoyaltyCard(userId);
            if (loyaltyCard == null) {
                throw new RuntimeException("Loyalty pricing requires an active loyalty card");
            }
            if (product.getCardholderPrice() == null) {
                throw new RuntimeException("This product does not have a cardholder price");
            }
            priceToUse = product.getCardholderPrice();
            
            // If product also has points requirement, include those
            if (product.getPointsToBeRedeem() != null && product.getPointsToBeRedeem() > 0) {
                // Calculate points for the NEW total quantity
                int newTotalQuantity = existingItem.isPresent() ? existingItem.get().getQuantity() + quantity : quantity;
                pointsToUse = product.getPointsToBeRedeem() * newTotalQuantity;
                
                // Validate sufficient points (exclude current item's points from used calculation)
                int usedInCart = getUsedPointsInCart(cart.getId()) - currentItemPoints;
                int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0) - usedInCart;
                
                if (pointsToUse > availablePoints) {
                    throw new RuntimeException(String.format(
                        "Insufficient loyalty points. Required: %d, Available: %d. Please remove items from cart to continue.",
                        pointsToUse, availablePoints
                    ));
                }
            }
        } 
        else if ("POINTS".equals(priceType)) {
            // POINTS requires active loyalty card and pointsToBeRedeem > 0
            Loyaltycard loyaltyCard = getActiveLoyaltyCard(userId);
            if (loyaltyCard == null) {
                throw new RuntimeException("Points redemption requires an active loyalty card");
            }
            if (product.getPointsToBeRedeem() == null || product.getPointsToBeRedeem() <= 0) {
                throw new RuntimeException("This product cannot be purchased with points");
            }
            
            // Calculate points for the NEW total quantity
            int newTotalQuantity = existingItem.isPresent() ? existingItem.get().getQuantity() + quantity : quantity;
            pointsToUse = product.getPointsToBeRedeem() * newTotalQuantity;
            
            // Validate sufficient points (exclude current item's points from used calculation)
            int usedInCart = getUsedPointsInCart(cart.getId()) - currentItemPoints;
            int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0) - usedInCart;
            
            if (pointsToUse > availablePoints) {
                throw new RuntimeException(String.format(
                    "Insufficient loyalty points. Required: %d, Available: %d. Please remove items from cart to continue.",
                    pointsToUse, availablePoints
                ));
            }
            
            // ✅ CRITICAL: For POINTS type, priceSnapshot MUST be ZERO (per requirements)
            // POINTS items are paid via points, not cash
            priceToUse = BigDecimal.ZERO;
        } 
        else {
            throw new RuntimeException(String.format(
                "Invalid price type: %s. Must be MRP, LOYALTY, or POINTS", priceType
            ));
        }

        // 6. Update or create cart item (existingItem already checked above)

        if (existingItem.isPresent()) {
            // ✅ SAME PRODUCT → UPDATE QUANTITY
            Cartitem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.setPriceSnapshot(priceToUse);
            item.setPriceType(priceType);
            
            // Recalculate points for new quantity
            if ("POINTS".equals(priceType) || ("LOYALTY".equals(priceType) && product.getPointsToBeRedeem() != null && product.getPointsToBeRedeem() > 0)) {
                item.setPointsUsed((product.getPointsToBeRedeem() != null ? product.getPointsToBeRedeem() : 0) * item.getQuantity());
            } else {
                item.setPointsUsed(0);
            }
            
            cartItemRepository.save(item);

        } else {
            // ✅ NEW PRODUCT → CREATE CART ITEM
            Cartitem newItem = new Cartitem();
            newItem.setCart(cart);
            newItem.setProd(product);
            newItem.setQuantity(quantity);
            newItem.setPriceSnapshot(priceToUse);
            newItem.setPriceType(priceType);
            newItem.setPointsUsed(pointsToUse);

            cartItemRepository.save(newItem);
        }
    }


    @Override
    public void removeFromCart(Integer userId, Integer productId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = user.getCart();
        if (cart == null) {
            throw new RuntimeException("Cart not found");
        }

        Cartitem item = cartItemRepository
                .findByCart_IdAndProd_Id(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        cartItemRepository.delete(item);
    }

    @Override
    public void viewCart(Integer userId) {
        Cart cart = cartRepository
                .findByUser_IdAndIsActive(userId, 'Y')
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartItemRepository.findByCart_Id(cart.getId())
                .forEach(i ->
                        System.out.println(
                                i.getProd().getProdName() +
                                " x " + i.getQuantity() +
                                " = " + i.getPriceSnapshot() +
                                " [" + i.getPriceType() + "]" +
                                " (Points: " + i.getPointsUsed() + ")"
                        )
                );
    }

    @Transactional
    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }
}
