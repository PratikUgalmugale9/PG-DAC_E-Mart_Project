package com.example.service;


import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.dto.PaymentRequestDTO;
import com.example.dto.PaymentResponseDTO;
import com.example.entity.OrderItem;
import com.example.entity.Ordermaster;
import com.example.repository.OrderItemRepository;
import com.example.repository.OrderRepository;
import com.example.entity.Payment;
import com.example.entity.User;
import com.example.repository.PaymentRepository;

@Service
public class PaymentServiceImpl implements PaymentService {

	@Autowired
	private EmailService emailService; // Added by Hamzah

	@Autowired
	private InvoicePdfService invoicePdfService; // Added by Hamzah

	@Autowired
	private OrderRepository orderRepository; // Added by Hamzah
	
	@Autowired
	private OrderItemRepository orderItemRepository; // Added by Hamzah

	
    @Autowired
    private PaymentRepository paymentRepository;

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

    // ✅ ADD THIS LINE HERE
    payment.setPaymentStatus(
            dto.getPaymentStatus() != null ? dto.getPaymentStatus() : "initiated"
    );

    payment.setTransactionId(dto.getTransactionId());

    // ✅ Always set payment date
    payment.setPaymentDate(Instant.now());

    Payment saved = paymentRepository.save(payment);
 // Added by Hamzah - payment success mail with invoice
    if ("SUCCESS".equalsIgnoreCase(saved.getPaymentStatus())) {

        Ordermaster orderMaster =
                orderRepository.findById(saved.getOrder().getId())
                        .orElseThrow(() -> new RuntimeException("Order not found"));

     // Added by Hamzah - fetch order items separately
        List<OrderItem> items =
                orderItemRepository.findByOrder_Id(orderMaster.getId());

        byte[] invoicePdf =
                invoicePdfService.generateInvoiceAsBytes(orderMaster, items);

        try {
            emailService.sendPaymentSuccessMail(orderMaster, invoicePdf);
        } catch (Exception e) {
            // Added by Hamzah - email failure should not break payment flow
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