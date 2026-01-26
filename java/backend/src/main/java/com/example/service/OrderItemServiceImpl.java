package com.example.service;

import com.example.entity.OrderItem;
import com.example.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderItemRepository orderItemRepository;

    public OrderItemServiceImpl(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public List<OrderItem> getItemsByOrderId(Integer orderId) {
        return orderItemRepository.findByOrder_Id(orderId);
    }
}
