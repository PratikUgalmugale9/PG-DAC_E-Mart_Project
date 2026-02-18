package com.example.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cartitem")
public class Cartitem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CartItem_Id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Cart_Id", nullable = false)
    private Cart cart;

    // new addition to for many cartitem can have many products but each cartitem - one product.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Prod_Id", nullable = false)
    private Product prod;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "PriceSnapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceSnapshot;

    /**
     * The pricing type selected: MRP, LOYALTY, or POINTS
     */
    @Column(name = "price_type", length = 10)
    private String priceType = "MRP";

    /**
     * Number of loyalty points used for this item (0 if MRP or LOYALTY)
     */
    @Column(name = "points_used")
    private Integer pointsUsed = 0;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Product getProd() {
        return prod;
    }

    public void setProd(Product prod) {
        this.prod = prod;
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