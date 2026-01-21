package com.example.service;

import com.example.entity.Ordermaster;
import com.example.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public Ordermaster placeOrder(Ordermaster order) {
        // Here future business logic can be added:
        // discount, loyalty points, etc.
        return orderRepository.save(order);
    }

    @Override
    public List<Ordermaster> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Ordermaster getOrderById(Integer id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public Ordermaster updateOrder(Integer id, Ordermaster updatedOrder) {
        Ordermaster existing = orderRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setOrderStatus(updatedOrder.getOrderStatus());
            existing.setPaymentMode(updatedOrder.getPaymentMode());
            existing.setTotalAmount(updatedOrder.getTotalAmount());
            return orderRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }
}