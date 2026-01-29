package com.example.service;

import com.example.entity.Cartitem;
import com.example.entity.OrderItem;
import com.example.entity.Ordermaster;
import com.example.entity.User;
import com.example.repository.CartItemRepository;
import com.example.repository.OrderItemRepository;
import com.example.repository.OrderRepository;
import com.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    // ✅ Constructor Injection
    public OrderServiceImpl(OrderRepository orderRepository,
            UserRepository userRepository,
            CartItemRepository cartItemRepository,
            OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
    }

    // ✅ MAIN METHOD: Place Order from Cart
    @Override
    @Transactional
    public Ordermaster placeOrderFromCart(Integer userId, Integer cartId, String paymentMode) {

        // ✅ Step 1: Check User exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // ✅ Step 2: Fetch all cart items by cartId
        List<Cartitem> cartItems = cartItemRepository.findByCart_Id(cartId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot place order.");
        }

        // ✅ Step 3: Calculate Total Amount
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (Cartitem item : cartItems) {
            BigDecimal itemTotal = item.getPriceSnapshot()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // ✅ Step 4: Create OrderMaster
        Ordermaster ordermaster = new Ordermaster();
        ordermaster.setUser(user);
        ordermaster.setPaymentMode(paymentMode);
        ordermaster.setOrderStatus("Pending");
        ordermaster.setTotalAmount(totalAmount);

        // ✅ Step 5: Save OrderMaster (generates order_id)
        Ordermaster savedOrder = orderRepository.save(ordermaster);

        // ✅ Step 6: Create OrderItem list from cart items
        List<OrderItem> orderItems = new ArrayList<>();

        for (Cartitem cartItem : cartItems) {

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProd()); // ✅ your cartitem uses getProd()
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPriceSnapshot());

            orderItems.add(orderItem);
        }

        // ✅ Step 7: Save all OrderItems
        orderItemRepository.saveAll(orderItems);

        // ✅ Step 8: Clear cart after order is placed
        cartItemRepository.deleteAll(cartItems);

        // ✅ Optional: attach items in response
        // savedOrder.setItems(orderItems);

        // ✅ Return saved order
        return savedOrder;
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