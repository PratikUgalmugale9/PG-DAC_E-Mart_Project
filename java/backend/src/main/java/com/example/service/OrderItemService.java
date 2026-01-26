package com.example.service;

import com.example.entity.OrderItem;
import java.util.List;

public interface OrderItemService {
    List<OrderItem> getItemsByOrderId(Integer orderId);
}
