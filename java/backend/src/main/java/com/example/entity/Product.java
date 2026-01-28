package com.example.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prod_id")
    private Integer id;

    // one product can be in many cart items
    @OneToMany(mappedBy = "prod")
    @JsonIgnore
    private List<Cartitem> cartItems;

    // FK to catmaster.id
    @Column(name = "cat_master_id", nullable = false)
    private Integer categoryId;

    @Column(name = "prod_name", nullable = false, length = 150)
    private String prodName;

    // 🔥🔥🔥 THIS WAS MISSING — VERY IMPORTANT
    @Column(name = "prod_image_path", length = 255)
    private String prodImagePath;

    @Column(name = "prod_short_desc", length = 255)
    private String prodShortDesc;

    @Column(name = "prod_long_desc", columnDefinition = "TEXT")
    private String prodLongDesc;

    @Column(name = "mrp_price", precision = 10, scale = 2)
    private BigDecimal mrpPrice;

    @Column(name = "cardholder_price", precision = 10, scale = 2)
    private BigDecimal cardholderPrice;

    @Column(name = "points_2b_redeem")
    private Integer pointsToBeRedeem;

    // ---------- Constructors ----------

    public Product() {
    }

    // ---------- Getters & Setters ----------

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getProdName() {
        return prodName;
    }

    public void setProdName(String prodName) {
        this.prodName = prodName;
    }

    // 🔥🔥🔥 VERY IMPORTANT GETTER & SETTER
    public String getProdImagePath() {
        return prodImagePath;
    }

    public void setProdImagePath(String prodImagePath) {
        this.prodImagePath = prodImagePath;
    }

    public String getProdShortDesc() {
        return prodShortDesc;
    }

    public void setProdShortDesc(String prodShortDesc) {
        this.prodShortDesc = prodShortDesc;
    }

    public String getProdLongDesc() {
        return prodLongDesc;
    }

    public void setProdLongDesc(String prodLongDesc) {
        this.prodLongDesc = prodLongDesc;
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
}
