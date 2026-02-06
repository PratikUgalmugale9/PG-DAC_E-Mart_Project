package com.example.dto;

import java.math.BigDecimal;

/**
 * Aligned with frontend requirements in CartContext.jsx
 */
public class CartItemResponseDTO {

    private Integer id; // Still kept for internal reference
    private Integer cartId;
    private Integer cartItemId; // Expected by frontend for delete/update
    private Integer productId;
    private String productName;
    private String prodImagePath; // Expected by frontend for images
    private Integer quantity;
    private BigDecimal priceSnapshot; // Expected by frontend for calculations
    private BigDecimal mrpPrice;
    private BigDecimal cardholderPrice;
    private Integer pointsToBeRedeem; // Expected by frontend
    private BigDecimal totalPrice;
    private String priceType;
    private Integer pointsUsed;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
        this.cartItemId = id;
    }

    public Integer getCartItemId() {
        return cartItemId;
    }

    public void setCartItemId(Integer cartItemId) {
        this.cartItemId = cartItemId;
    }

    public Integer getCartId() {
        return cartId;
    }

    public void setCartId(Integer cartId) {
        this.cartId = cartId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProdImagePath() {
        return prodImagePath;
    }

    public void setProdImagePath(String prodImagePath) {
        this.prodImagePath = prodImagePath;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceSnapshot() {
        return priceSnapshot;
    }

    public void setPriceSnapshot(BigDecimal priceSnapshot) {
        this.priceSnapshot = priceSnapshot;
    }

    public BigDecimal getMrpPrice() {
        return mrpPrice;
    }

    public void setMrpPrice(BigDecimal mrpPrice) {
        this.mrpPrice = mrpPrice;
    }

    public BigDecimal getCardholderPrice() {
        return cardholderPrice;
    }

    public void setCardholderPrice(BigDecimal cardholderPrice) {
        this.cardholderPrice = cardholderPrice;
    }

    public Integer getPointsToBeRedeem() {
        return pointsToBeRedeem;
    }

    public void setPointsToBeRedeem(Integer pointsToBeRedeem) {
        this.pointsToBeRedeem = pointsToBeRedeem;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getPriceType() {
        return priceType;
    }

    public void setPriceType(String priceType) {
        this.priceType = priceType;
    }

    public Integer getPointsUsed() {
        return pointsUsed;
    }

    public void setPointsUsed(Integer pointsUsed) {
        this.pointsUsed = pointsUsed;
    }
}
