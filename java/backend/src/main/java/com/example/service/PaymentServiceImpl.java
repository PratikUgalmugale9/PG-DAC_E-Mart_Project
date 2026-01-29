package com.example.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.PaymentRequestDTO;
import com.example.dto.PaymentResponseDTO;
import com.example.entity.*;
import com.example.repository.*;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoicePdfService invoicePdfService;

    @Autowired
    private EmailService emailService;

    // ==================================================
    // MAIN PAYMENT FLOW (TRANSACTIONAL)
    // ==================================================
    @Override
    @Transactional
    public PaymentResponseDTO createPayment(PaymentRequestDTO dto) {

        // 1️⃣ FETCH USER
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2️⃣ FETCH ACTIVE CART
        Cart cart = cartRepository
                .findByUser_IdAndIsActive(dto.getUserId(), 'Y')
                .orElseThrow(() -> new RuntimeException("Active cart not found"));

        // 3️⃣ FETCH CART ITEMS
        List<Cartitem> cartItems = cartItemRepository.findByCart_Id(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty, cannot place order");
        }

        // 4️⃣ CREATE ORDER MASTER
        Ordermaster order = new Ordermaster();
        order.setUser(user);
        order.setTotalAmount(dto.getAmountPaid());
        order.setOrderStatus("PAID");
        order.setPaymentMode("RAZORPAY");

        order = orderRepository.save(order);

        // 5️⃣ CREATE ORDER ITEMS FROM CART
        for (Cartitem ci : cartItems) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProd()); // ✅ correct mapping
            oi.setQuantity(ci.getQuantity());
            oi.setPrice(ci.getPriceSnapshot());

            orderItemRepository.save(oi);
        }

        // 6️⃣ SAVE PAYMENT
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(user);
        payment.setAmountPaid(dto.getAmountPaid());
        payment.setPaymentMode("RAZORPAY");
        payment.setPaymentStatus("SUCCESS");
        payment.setTransactionId(dto.getTransactionId());
        payment.setPaymentDate(Instant.now());

        Payment savedPayment = paymentRepository.save(payment);

        // 7️⃣ GENERATE INVOICE + SEND EMAIL
        List<OrderItem> orderItems = orderItemRepository.findByOrder_Id(order.getId());

        byte[] invoicePdf = invoicePdfService.generateInvoiceAsBytes(order, orderItems);

        try {
            emailService.sendPaymentSuccessMail(order, invoicePdf);
        } catch (Exception e) {
            // Email failure should NOT rollback payment
            e.printStackTrace();
        }

        // 8️⃣ CLEAR CART
        cartItemRepository.deleteAll(cartItems);
        cart.setIsActive('N');
        cartRepository.save(cart);

        // 9️⃣ RETURN RESPONSE
        return mapToDTO(savedPayment);
    }

    // ==================================================
    // READ METHODS
    // ==================================================
    @Override
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponseDTO getPaymentById(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToDTO(payment);
    }

    @Override
    public List<PaymentResponseDTO> getPaymentsByUser(Integer userId) {
        return paymentRepository.findByUser_Id(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ==================================================
    // DTO MAPPER
    // ==================================================
    private PaymentResponseDTO mapToDTO(Payment p) {

        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setPaymentId(p.getId());
        dto.setAmountPaid(p.getAmountPaid());
        dto.setPaymentMode(p.getPaymentMode());
        dto.setPaymentStatus(p.getPaymentStatus());
        dto.setTransactionId(p.getTransactionId());
        dto.setPaymentDate(p.getPaymentDate());

        dto.setOrderId(p.getOrder().getId());
        dto.setUserId(p.getUser().getId());
        dto.setUserName(p.getUser().getFullName());
        dto.setUserEmail(p.getUser().getEmail());

        return dto;
    }
}
