package com.example.dto;

public class PlaceOrderRequest {
    private Integer userId;
    private Integer cartId;
    private String paymentMode;
    private java.math.BigDecimal pointsToRedeem;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getCartId() {
        return cartId;
    }

    public void setCartId(Integer cartId) {
        this.cartId = cartId;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public java.math.BigDecimal getPointsToRedeem() {
        return pointsToRedeem;
    }

    public void setPointsToRedeem(java.math.BigDecimal pointsToRedeem) {
        this.pointsToRedeem = pointsToRedeem;
    }
}