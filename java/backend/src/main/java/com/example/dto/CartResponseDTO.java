package com.example.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponseDTO {
    private Integer id;
    private Character isActive;
    private List<CartItemResponseDTO> items;
    private BigDecimal totalAmount;
    private Integer totalPointsUsed;

    public CartResponseDTO() {
    }

    public CartResponseDTO(Integer id, Character isActive, List<CartItemResponseDTO> items, BigDecimal totalAmount,
            Integer totalPointsUsed) {
        this.id = id;
        this.isActive = isActive;
        this.items = items;
        this.totalAmount = totalAmount;
        this.totalPointsUsed = totalPointsUsed;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Character getIsActive() {
        return isActive;
    }

    public void setIsActive(Character isActive) {
        this.isActive = isActive;
    }

    public List<CartItemResponseDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponseDTO> items) {
        this.items = items;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getTotalPointsUsed() {
        return totalPointsUsed;
    }

    public void setTotalPointsUsed(Integer totalPointsUsed) {
        this.totalPointsUsed = totalPointsUsed;
    }
}
