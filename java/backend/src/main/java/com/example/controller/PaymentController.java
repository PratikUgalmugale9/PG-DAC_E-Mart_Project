package com.example.controller;

import com.example.dto.PaymentRequestDTO;
import com.example.dto.PaymentResponseDTO;
import com.example.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // ✅ CREATE payment
    @PostMapping
    public PaymentResponseDTO createPayment(@RequestBody PaymentRequestDTO dto) {
        return paymentService.createPayment(dto);
    }

    // ✅ GET all payments
    @GetMapping
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentService.getAllPayments();
    }

    // ✅ GET payment by id
    @GetMapping("/{id}")
    public PaymentResponseDTO getPaymentById(@PathVariable Integer id) {
        return paymentService.getPaymentById(id);
    }

    // ✅ GET payments by user id
    @GetMapping("/user/{userId}")
    public List<PaymentResponseDTO> getPaymentsByUser(@PathVariable Integer userId) {
        return paymentService.getPaymentsByUser(userId);
    }
}