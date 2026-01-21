package com.example.controller;

import com.example.entity.Ordermaster;
import com.example.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin   // ✅ Allows Postman / React frontend calls
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // CREATE
    @PostMapping
    public Ordermaster createOrder(@RequestBody Ordermaster order) {
        return orderService.placeOrder(order);
    }

    // READ ALL
    @GetMapping
    public List<Ordermaster> getAllOrders() {
        return orderService.getAllOrders();
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Ordermaster getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Ordermaster updateOrder(@PathVariable Integer id,
                                   @RequestBody Ordermaster order) {
        return orderService.updateOrder(id, order);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
    }
}
