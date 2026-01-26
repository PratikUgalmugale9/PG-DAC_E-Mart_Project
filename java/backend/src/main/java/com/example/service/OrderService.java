package com.example.service;

import com.example.entity.Ordermaster;
import java.util.List;

public interface OrderService {

    Ordermaster placeOrderFromCart(Integer userId, Integer cartId, String paymentMode);

    List<Ordermaster> getAllOrders();

    Ordermaster getOrderById(Integer id);

    List<Ordermaster> getOrdersByUser(Integer userId);
}
