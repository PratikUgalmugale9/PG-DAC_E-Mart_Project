package com.example.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.dto.PaymentRequestDTO;
import com.example.dto.PaymentResponseDTO;
import com.example.entity.Cartitem;
import com.example.entity.Loyaltycard;
import com.example.entity.OrderItem;
import com.example.entity.Ordermaster;
import com.example.repository.CartItemRepository;
import com.example.repository.OrderItemRepository;
import com.example.repository.OrderRepository;
import com.example.entity.Payment;
import com.example.entity.User;
import com.example.repository.PaymentRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private InvoicePdfService invoicePdfService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private LoyaltycardService loyaltycardService;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Override
    public PaymentResponseDTO createPayment(PaymentRequestDTO dto) {

        Payment payment = new Payment();

        Ordermaster order = new Ordermaster();
        order.setId(dto.getOrderId());

        User user = new User();
        user.setId(dto.getUserId());

        payment.setOrder(order);
        payment.setUser(user);
        payment.setAmountPaid(dto.getAmountPaid());
        payment.setPaymentMode(dto.getPaymentMode());
        payment.setPaymentStatus(
                dto.getPaymentStatus() != null ? dto.getPaymentStatus() : "initiated");
        payment.setTransactionId(dto.getTransactionId());
        payment.setPaymentDate(Instant.now());

        Payment saved = paymentRepository.save(payment);
        
        // ========================================
        // PAYMENT SUCCESS PROCESSING
        // ========================================
        if ("SUCCESS".equalsIgnoreCase(saved.getPaymentStatus())) {

            Ordermaster orderMaster = orderRepository.findById(saved.getOrder().getId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            List<OrderItem> items = orderItemRepository.findByOrder_Id(orderMaster.getId());

            // 1. DEDUCT POINTS (ONLY after successful payment)
            int totalPointsUsed = items.stream()
                    .mapToInt(OrderItem::getPointsUsed)
                    .sum();
            
            if (totalPointsUsed > 0) {
                try {
                    loyaltycardService.updatePoints(saved.getUser().getId(), -totalPointsUsed);
                } catch (Exception e) {
                    System.err.println("Failed to deduct points: " + e.getMessage());
                }
            }

            // 2. AWARD POINTS (10% of cash-paid items ONLY, exclude POINTS items)
            try {
                Loyaltycard loyaltyCard = loyaltycardService.getLoyaltycardByUserId(saved.getUser().getId());
                
                if (loyaltyCard != null && (loyaltyCard.getIsActive() == 'Y' || loyaltyCard.getIsActive() == 'y')) {
                    // Calculate points ONLY on cash-paid items (exclude POINTS items)
                    java.math.BigDecimal cashPaidAmount = items.stream()
                            .filter(i -> !"POINTS".equals(i.getPriceType()))
                            .map(i -> i.getPrice().multiply(java.math.BigDecimal.valueOf(i.getQuantity())))
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                    
                    int pointsEarned = cashPaidAmount.multiply(java.math.BigDecimal.valueOf(0.10)).intValue();
                    
                    if (pointsEarned > 0) {
                        loyaltycardService.updatePoints(saved.getUser().getId(), pointsEarned);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to award points: " + e.getMessage());
            }

            // 3. CLEAR CART (after successful payment)
            try {
                List<Cartitem> userCartItems = cartItemRepository.findByCart_Id(orderMaster.getUser().getCart().getId());
                if (!userCartItems.isEmpty()) {
                    cartItemRepository.deleteAll(userCartItems);
                }
            } catch (Exception e) {
                System.err.println("Failed to clear cart: " + e.getMessage());
            }

            // 4. GENERATE INVOICE & EMAIL
            byte[] invoicePdf = invoicePdfService.generateInvoiceAsBytes(orderMaster, items);

            try {
                emailService.sendPaymentSuccessMail(orderMaster, invoicePdf);
            } catch (Exception e) {
                e.printStackTrace();
            }

        }

        return mapToDTO(saved);
    }

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

    // 🔁 Mapper method
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