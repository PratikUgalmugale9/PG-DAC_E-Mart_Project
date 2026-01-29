package com.example.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "catmaster")
public class Catmaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cat_master_id", nullable = false)
    private Integer id;

    @Column(name = "cat_id", nullable = false, length = 10)
    private String catId;

    // @Column(name = "SubCat_Id", length = 10)
    // private String subcatId;

    @Column(name = "sub_cat_id")
    private String subcatId;

    @Column(name = "cat_name", nullable = false, length = 100)
    private String catName;

    @Column(name = "cat_image_path")
    private String catImagePath;

    @ColumnDefault("'N'")
    @Column(name = "flag")
    private Character flag;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCatId() {
        return catId;
    }

    public void setCatId(String catId) {
        this.catId = catId;
    }

    public String getSubcatId() {
        return subcatId;
    }

    public void setSubcatId(String subcatId) {
        this.subcatId = subcatId;
    }

    public String getCatName() {
        return catName;
    }

    public void setCatName(String catName) {
        this.catName = catName;
    }

    public String getCatImagePath() {
        return catImagePath;
    }

    public void setCatImagePath(String catImagePath) {
        this.catImagePath = catImagePath;
    }

    public Character getFlag() {
        return flag;
    }

    public void setFlag(Character flag) {
        this.flag = flag;
    }

}