package org.example.dto;

import java.math.BigDecimal;

public class ProductCardDTO {

    private Long id;
    private String name;
    private String brand;
    private String category;
    private String image;
    private BigDecimal price;
    private BigDecimal discount;

    public ProductCardDTO(
            Long id,
            String name,
            String brand,
            String category,
            String image,
            BigDecimal price,
            BigDecimal discount
    ) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.image = image;
        this.price = price;
        this.discount = discount;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getCategory() {
        return category;
    }

    public String getImage() {
        return image;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getDiscount() {
        return discount;
    }
}