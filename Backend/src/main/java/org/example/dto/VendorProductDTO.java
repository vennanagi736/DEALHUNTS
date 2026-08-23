package org.example.dto;

public class VendorProductDTO {

    private Long id;
    private String name;
    private String description;

    private String brand;
    private String category;

    private Integer variantId;
    private Integer colorId;

    private Double sellingPrice;
    private Integer stock;

    public VendorProductDTO(
            Long id,
            String name,
            String description,
            String brand,
            String category,
            Integer variantId,
            Integer colorId,
            Double sellingPrice,
            Integer stock
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.brand = brand;
        this.category = category;
        this.variantId = variantId;
        this.colorId = colorId;
        this.sellingPrice = sellingPrice;
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

    public Integer getVariantId() {
        return variantId;
    }

    public Integer getColorId() {
        return colorId;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public Integer getStock() {
        return stock;
    }
}