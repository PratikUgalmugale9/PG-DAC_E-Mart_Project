package com.example.service;

import com.example.dto.PaymentRequestDTO;
import com.example.dto.PaymentResponseDTO;

import java.util.List;

public interface PaymentService {

    PaymentResponseDTO createPayment(PaymentRequestDTO dto);

    List<PaymentResponseDTO> getAllPayments();

    PaymentResponseDTO getPaymentById(Integer id);

    List<PaymentResponseDTO> getPaymentsByUser(Integer userId);
}