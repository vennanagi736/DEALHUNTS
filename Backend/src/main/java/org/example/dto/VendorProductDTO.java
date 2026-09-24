package org.example.dto;

import java.math.BigDecimal;

public class VendorProductDTO {

    private Long inventoryId;
    private Long productId;

    private String name;
    private String description;
    private String brand;
    private String category;

    private Long variantId;
    private Long colorId;

    private BigDecimal basePrice;
    private BigDecimal discount;
    private BigDecimal sellingPrice;

    private Integer stock;

    private String image;

    public VendorProductDTO(
            Long inventoryId,
            Long productId,
            String name,
            String description,
            String brand,
            String category,
            Long variantId,
            Long colorId,
            BigDecimal basePrice,
            BigDecimal discount,
            BigDecimal sellingPrice,
            Integer stock,
            String image
    ) {
        this.inventoryId = inventoryId;
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.brand = brand;
        this.category = category;
        this.variantId = variantId;
        this.colorId = colorId;
        this.basePrice = basePrice;
        this.discount = discount;
        this.sellingPrice = sellingPrice;
        this.stock = stock;
        this.image = image;
    }

    public Long getInventoryId() {
        return inventoryId;
    }

    public Long getProductId() {
        return productId;
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

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public Integer getStock() {
        return stock;
    }

    public String getImage() {
        return image;
    }
}