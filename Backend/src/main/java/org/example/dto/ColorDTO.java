package org.example.dto;

import java.math.BigDecimal;

public class ColorDTO {

    private Long id;
    private String name;
    private String hexCode;
    private BigDecimal price;
    private BigDecimal discount;

    public ColorDTO() {
    }

    public ColorDTO(
            Long id,
            String name,
            String hexCode,
            BigDecimal price,
            BigDecimal discount
    ) {
        this.id = id;
        this.name = name;
        this.hexCode = hexCode;
        this.price = price;
        this.discount = discount;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getHexCode() {
        return hexCode;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setHexCode(String hexCode) {
        this.hexCode = hexCode;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }
}