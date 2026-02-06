package com.example.service;

import com.example.entity.Cartitem;
import com.example.entity.Loyaltycard;
import com.example.entity.OrderItem;
import com.example.entity.Ordermaster;
import com.example.entity.User;
import com.example.repository.CartItemRepository;
import com.example.repository.OrderItemRepository;
import com.example.repository.OrderRepository;
import com.example.repository.UserRepository;
import com.example.dto.OrderResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final LoyaltycardService loyaltycardService;
    private final EmailService emailService;
    private final InvoicePdfService invoicePdfService;

    public OrderServiceImpl(OrderRepository orderRepository,
            UserRepository userRepository,
            CartItemRepository cartItemRepository,
            OrderItemRepository orderItemRepository,
            LoyaltycardService loyaltycardService,
            EmailService emailService,
            InvoicePdfService invoicePdfService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
        this.loyaltycardService = loyaltycardService;
        this.emailService = emailService;
        this.invoicePdfService = invoicePdfService;
    }

    @Override
    @Transactional
    public OrderResponseDTO placeOrderFromCart(Integer userId, Integer cartId, String paymentMode) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (cartId == null && user.getCart() != null) {
            cartId = user.getCart().getId();
        }

        if (cartId == null) {
            throw new RuntimeException("Cart ID is missing and could not be resolved.");
        }

        List<Cartitem> cartItems = cartItemRepository.findByCart_Id(cartId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot place order.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalPointsRequired = 0;

        for (Cartitem item : cartItems) {
            BigDecimal price = item.getPriceSnapshot();
            if (price == null) {
                price = item.getProd().getMrpPrice();
            }
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));

            Integer productPoints = item.getProd().getPointsToBeRedeem();
            if (productPoints != null && productPoints > 0) {
                totalPointsRequired += productPoints * item.getQuantity();
            }
        }

        BigDecimal amountPaidByPoints = BigDecimal.ZERO;
        if ("LOYALTY".equalsIgnoreCase(paymentMode)) {
            Loyaltycard card = loyaltycardService.getLoyaltycardByUserId(userId);
            if (card == null)
                throw new RuntimeException("Loyalty card not found");
            if (card.getPointsBalance() < totalPointsRequired) {
                throw new RuntimeException("Insufficient loyalty points. Required: " + totalPointsRequired
                        + ", Available: " + card.getPointsBalance());
            }
            amountPaidByPoints = BigDecimal.valueOf(totalPointsRequired);
            loyaltycardService.updatePoints(userId, -totalPointsRequired);
        }

        BigDecimal amountPaidByCash = totalAmount.subtract(amountPaidByPoints);
        if (amountPaidByCash.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Points-only purchase is not allowed. Please pay some amount by cash.");
        }

        Ordermaster ordermaster = new Ordermaster();
        ordermaster.setUser(user);
        ordermaster.setPaymentMode(paymentMode);
        ordermaster.setOrderStatus("Pending");
        ordermaster.setTotalAmount(totalAmount);
        ordermaster.setItems(new ArrayList<>());

        Ordermaster savedOrder = orderRepository.save(ordermaster);

        for (Cartitem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProd());
            orderItem.setQuantity(cartItem.getQuantity());
            BigDecimal itemPrice = cartItem.getPriceSnapshot();
            if (itemPrice == null)
                itemPrice = cartItem.getProd().getMrpPrice();
            orderItem.setPrice(itemPrice);
            orderItem.setPriceType(cartItem.getPriceType());
            orderItem.setPointsUsed(cartItem.getPointsUsed());
            savedOrder.getItems().add(orderItem);
        }

        orderItemRepository.saveAll(savedOrder.getItems());
        cartItemRepository.deleteAll(cartItems);

        try {
            int pointsEarned = totalAmount.multiply(BigDecimal.valueOf(0.10)).intValue();
            if (pointsEarned > 0)
                loyaltycardService.updatePoints(userId, pointsEarned);
        } catch (Exception e) {
            System.err.println("Loyalty points credit failed: " + e.getMessage());
        }

        try {
            byte[] invoicePdf = invoicePdfService.generateInvoicePdf(savedOrder, savedOrder.getItems());
            emailService.sendPaymentSuccessMail(savedOrder, invoicePdf);
        } catch (Exception e) {
            System.err.println("Failed to send order email: " + e.getMessage());
        }

        return mapToOrderResponseDTO(savedOrder);
    }

    private OrderResponseDTO mapToOrderResponseDTO(Ordermaster order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getId());
        if (order.getOrderDate() != null) {
            dto.setOrderDate(order.getOrderDate()
                    .atZone(ZoneId.systemDefault())
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setPaymentMode(order.getPaymentMode());
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                OrderResponseDTO.OrderItemDTO itemDto = new OrderResponseDTO.OrderItemDTO();
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductName(item.getProduct().getProdName());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getPrice());
                itemDto.setPriceType(item.getPriceType());
                return itemDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO getOrderById(Integer id) {
        Ordermaster order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return mapToOrderResponseDTO(order);
    }

    @Override
    public List<OrderResponseDTO> getOrdersByUser(Integer userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToOrderResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Ordermaster getOrderEntity(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order entity not found with id: " + id));
    }
}