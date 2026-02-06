package com.example.service;

import com.example.dto.OrderResponseDTO;
import java.util.List;

public interface OrderService {

    OrderResponseDTO placeOrderFromCart(Integer userId, Integer cartId, String paymentMode);

    List<OrderResponseDTO> getAllOrders();

    OrderResponseDTO getOrderById(Integer id);

    List<OrderResponseDTO> getOrdersByUser(Integer userId);

    com.example.entity.Ordermaster getOrderEntity(Integer id);
}