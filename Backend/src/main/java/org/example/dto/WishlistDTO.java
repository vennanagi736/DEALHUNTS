package org.example.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WishlistDTO {

    private Integer id;

    private Long productId;

    private String name;

    private String brand;

    private String category;

    private String description;

    private String thumbnailUrl;

    private BigDecimal basePrice;

    private LocalDateTime createdAt;


    // =========================================================
    // ID
    // =========================================================

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }


    // =========================================================
    // PRODUCT ID
    // =========================================================

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }


    // =========================================================
    // NAME
    // =========================================================

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    // =========================================================
    // BRAND
    // =========================================================

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }


    // =========================================================
    // CATEGORY
    // =========================================================

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    // =========================================================
    // DESCRIPTION
    // =========================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    // =========================================================
    // THUMBNAIL
    // =========================================================

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }


    // =========================================================
    // BASE PRICE
    // =========================================================

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    // =========================================================
    // CREATED AT
    // =========================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}