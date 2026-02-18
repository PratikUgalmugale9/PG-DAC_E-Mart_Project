package com.example.service;

import com.example.entity.Cartitem;
import com.example.entity.Loyaltycard;
import com.example.entity.*;
import com.example.exception.BadRequestException;
import com.example.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final LoyaltycardService loyaltycardService;

    // ✅ Constructor Injection
    public OrderServiceImpl(OrderRepository orderRepository,
            UserRepository userRepository,
            CartItemRepository cartItemRepository,
            OrderItemRepository orderItemRepository,
            LoyaltycardService loyaltycardService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
        this.loyaltycardService = loyaltycardService;
    }

    // ✅ MAIN METHOD: Place Order from Cart
    @Override
    @Transactional
    public Ordermaster placeOrderFromCart(Integer userId, Integer cartId, String paymentMode) {
        try {
            // ✅ Step 1: Check User exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BadRequestException("User not found with id: " + userId));

            // ✅ Step 2: Fetch all cart items
            if (cartId == null && user.getCart() != null) {
                cartId = user.getCart().getId();
            }

            if (cartId == null) {
                throw new BadRequestException("Cart ID is missing and could not be resolved.");
            }

            List<Cartitem> cartItems = cartItemRepository.findByCart_Id(cartId);

            if (cartItems.isEmpty()) {
                throw new BadRequestException("Cart is empty. Cannot place order.");
            }

            // ========================================
            // VALIDATION 1: Loyalty Card Status Check
            // ========================================
            boolean hasNonMrpItems = cartItems.stream()
                    .anyMatch(ci -> ci.getPriceType() != null && !"MRP".equals(ci.getPriceType()));
            Loyaltycard loyaltyCard = null;

            if (hasNonMrpItems) {
                loyaltyCard = loyaltycardService.getLoyaltycardByUserId(userId);
                if (loyaltyCard == null) {
                    throw new BadRequestException(
                        "Loyalty card required for non-MRP pricing. Please use MRP pricing or obtain a loyalty card."
                    );
                }
                if (loyaltyCard.getIsActive() != 'Y' && loyaltyCard.getIsActive() != 'y') {
                    throw new BadRequestException(
                        "Your loyalty card is inactive. Please contact support or use MRP pricing."
                    );
                }
            }

            // ========================================
            // VALIDATION 2: Product Eligibility Check
            // ========================================
            for (Cartitem item : cartItems) {
                Product product = item.getProd();
                String priceType = item.getPriceType() != null ? item.getPriceType() : "MRP"; // Default to MRP

                if ("LOYALTY".equals(priceType)) {
                    if (product.getCardholderPrice() == null) {
                        throw new BadRequestException(
                            String.format("Product '%s' is not eligible for cardholder pricing.", 
                                product.getProdName())
                        );
                    }
                } else if ("POINTS".equals(priceType)) {
                    if (product.getPointsToBeRedeem() == null || product.getPointsToBeRedeem() <= 0) {
                        throw new BadRequestException(
                            String.format("Product '%s' cannot be purchased with points.", 
                                product.getProdName())
                        );
                    }
                }
            }

            // ========================================
            // VALIDATION 3: Verify Pricing Rules
            // ========================================
            for (Cartitem item : cartItems) {
                Product product = item.getProd();
                String priceType = item.getPriceType() != null ? item.getPriceType() : "MRP"; // Default to MRP
                BigDecimal expectedPrice;

                if ("MRP".equals(priceType)) {
                    expectedPrice = product.getMrpPrice() != null ? product.getMrpPrice() : BigDecimal.ZERO;
                } else if ("LOYALTY".equals(priceType)) {
                    expectedPrice = product.getCardholderPrice() != null ? product.getCardholderPrice() : BigDecimal.ZERO;
                } else { // POINTS
                    // ✅ CRITICAL: POINTS items must have priceSnapshot = ZERO
                    // They are paid via points, not cash
                    expectedPrice = BigDecimal.ZERO;
                }

                // Allow small rounding differences
                BigDecimal priceSnapshot = item.getPriceSnapshot() != null ? item.getPriceSnapshot() : BigDecimal.ZERO;
                if (priceSnapshot.subtract(expectedPrice).abs().compareTo(new BigDecimal("0.01")) > 0) {
                    throw new BadRequestException(
                        String.format("Price mismatch for '%s'. Expected: %s, Stored: %s. Please refresh cart.",
                            product.getProdName(), expectedPrice, priceSnapshot)
                    );
                }
            }

            // ========================================
            // VALIDATION 4: Points Sufficiency Check
            // ========================================
            int totalPointsUsed = cartItems.stream()
                    .mapToInt(ci -> ci.getPointsUsed() != null ? ci.getPointsUsed() : 0)
                    .sum();

            if (totalPointsUsed > 0) {
                if (loyaltyCard == null) {
                    loyaltyCard = loyaltycardService.getLoyaltycardByUserId(userId);
                }

                if (loyaltyCard == null || (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0) < totalPointsUsed) {
                    throw new BadRequestException(
                        String.format("Insufficient loyalty points. Required: %d, Available: %d",
                            totalPointsUsed, loyaltyCard != null ? loyaltyCard.getPointsBalance() : 0)
                    );
                }
            }

            // ========================================
            // VALIDATION 5: Reject 100% Points-Only Orders
            // ========================================
            // REMOVED: Now allowing 100% points orders per user request
            /*
            BigDecimal totalCashAmount = cartItems.stream()
                    .filter(ci -> ci.getPriceType() == null || "MRP".equals(ci.getPriceType()) || "LOYALTY".equals(ci.getPriceType()))
                    .map(ci -> ci.getPriceSnapshot().multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalCashAmount.compareTo(BigDecimal.ZERO) == 0 && totalPointsUsed > 0) {
                throw new BadRequestException(
                    "Cannot place order with 100% points. At least one cash-paid item is required."
                );
            }
            */


            // ========================================
            // CALCULATE TOTALS
            // ========================================
            BigDecimal totalAmount = cartItems.stream()
                    .map(ci -> ci.getPriceSnapshot().multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // ========================================
            // CREATE ORDER
            // ========================================
            Ordermaster ordermaster = new Ordermaster();
            ordermaster.setUser(user);
            ordermaster.setPaymentMode(paymentMode);
            ordermaster.setOrderStatus("Pending");
            ordermaster.setTotalAmount(totalAmount);
            ordermaster.setOrderDate(Instant.now()); // ✅ Explicitly set order date
            ordermaster.setItems(new ArrayList<>());

            // ✅ Save OrderMaster
            Ordermaster savedOrder = orderRepository.save(ordermaster);

            // ✅ Create OrderItems from cart items
            for (Cartitem cartItem : cartItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProduct(cartItem.getProd());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getPriceSnapshot());
                // ✅ Null-safe: default to 0 and "MRP" for backward compatibility
                orderItem.setPointsUsed(cartItem.getPointsUsed() != null ? cartItem.getPointsUsed() : 0);
                orderItem.setPriceType(cartItem.getPriceType() != null ? cartItem.getPriceType() : "MRP");

                savedOrder.getItems().add(orderItem);
            }

            // ✅ Save all OrderItems
            orderItemRepository.saveAll(savedOrder.getItems());

            // ========================================
            // NOTE: Points Deduction and Cart Clearing moved to PaymentService
            // to support payment failure scenarios (retain cart if failed).
            // ========================================

            return savedOrder;

        } catch (Exception e) {
            // Log the full exception for debugging
            System.err.println("❌ ERROR in placeOrderFromCart:");
            System.err.println("Message: " + e.getMessage());
            System.err.println("Class: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("Order placement failed: " + e.getMessage(), e);
        }
    }

    // ✅ Get all orders (Admin)
    @Override
    public List<Ordermaster> getAllOrders() {
        return orderRepository.findAll();
    }

    // ✅ Get order by orderId
    @Override
    public Ordermaster getOrderById(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    // ✅ Get user order history
    @Override
    public List<Ordermaster> getOrdersByUser(Integer userId) {
        return orderRepository.findByUserId(userId);
    }
}