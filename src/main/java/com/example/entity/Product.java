package com.example.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Prod_Id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CatMaster_Id", nullable = false)
    private Catmaster catMaster;

    @Column(name = "Prod_Name", nullable = false, length = 150)
    private String prodName;

    @Column(name = "Prod_Short_Desc")
    private String prodShortDesc;

    @Lob
    @Column(name = "Prod_Long_Desc")
    private String prodLongDesc;

    @Column(name = "MRP_Price", precision = 10, scale = 2)
    private BigDecimal mrpPrice;

    @Column(name = "Cardholder_Price", precision = 10, scale = 2)
    private BigDecimal cardholderPrice;

    @ColumnDefault("0")
    @Column(name = "Points_2B_Redeem")
    private Integer points2bRedeem;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Catmaster getCatMaster() {
        return catMaster;
    }

    public void setCatMaster(Catmaster catMaster) {
        this.catMaster = catMaster;
    }

    public String getProdName() {
        return prodName;
    }

    public void setProdName(String prodName) {
        this.prodName = prodName;
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

    public Integer getPoints2bRedeem() {
        return points2bRedeem;
    }

    public void setPoints2bRedeem(Integer points2bRedeem) {
        this.points2bRedeem = points2bRedeem;
    }

}