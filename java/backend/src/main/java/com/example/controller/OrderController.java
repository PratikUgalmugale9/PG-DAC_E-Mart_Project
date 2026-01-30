package com.example.controller;

import com.example.dto.PlaceOrderRequest;
import com.example.entity.Ordermaster;
import com.example.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public Ordermaster placeOrder(@RequestBody PlaceOrderRequest request) {
        return orderService.placeOrderFromCart(
                request.getUserId(),
                request.getCartId(),
                request.getPaymentMode(),
                request.getPointsToRedeem());
    }

    @GetMapping
    public List<Ordermaster> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public Ordermaster getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Ordermaster> getOrdersByUser(@PathVariable Integer userId) {
        return orderService.getOrdersByUser(userId);
    }
}