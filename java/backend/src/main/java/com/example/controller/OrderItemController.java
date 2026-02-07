package com.example.controller;

import com.example.entity.OrderItem;
import com.example.repository.OrderItemRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin
public class OrderItemController {

    private final OrderItemService orderItemService;

public OrderItemController(OrderItemService orderItemService) {
    this.orderItemService = orderItemService;
}

@GetMapping("/order/{orderId}")
public List<OrderItem> getItemsByOrder(@PathVariable Integer orderId) {
    return orderItemService.getItemsByOrderId(orderId);
    }
}
