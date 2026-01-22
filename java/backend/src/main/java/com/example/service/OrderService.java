package com.example.service;

import com.example.entity.Ordermaster;
import java.util.List;

public interface OrderService {

    Ordermaster placeOrder(Ordermaster order);

    List<Ordermaster> getAllOrders();

    Ordermaster getOrderById(Integer id);

    Ordermaster updateOrder(Integer id, Ordermaster order);

    void deleteOrder(Integer id);
}
