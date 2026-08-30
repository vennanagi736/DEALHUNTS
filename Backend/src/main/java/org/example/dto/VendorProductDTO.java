package org.example.dto;

import java.math.BigDecimal;

public class VendorProductDTO {

    private Long id;

    private String name;

    private String description;

    private String brand;

    private String category;

    private Long variantId;

    private Long colorId;

    private BigDecimal basePrice;

    private BigDecimal discount;

    private BigDecimal finalPrice;

    private Integer stock;

    public VendorProductDTO(
            Long id,
            String name,
            String description,
            String brand,
            String category,
            Long variantId,
            Long colorId,
            BigDecimal basePrice,
            BigDecimal discount,
            BigDecimal finalPrice,
            Integer stock
    ) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.brand = brand;
        this.category = category;
        this.variantId = variantId;
        this.colorId = colorId;
        this.basePrice = basePrice;
        this.discount = discount;
        this.finalPrice = finalPrice;
        this.stock = stock;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getBrand() {
        return brand;
    }

    public String getCategory() {
        return category;
    }

    public Long getVariantId() {
        return variantId;
    }

    public Long getColorId() {
        return colorId;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }

    public Integer getStock() {
        return stock;
    }
}