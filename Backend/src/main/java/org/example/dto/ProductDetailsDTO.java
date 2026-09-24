package org.example.dto;

import java.util.List;

public class ProductDetailsDTO {

    private Long id;
    private String name;
    private String brand;
    private String category;
    private String description;
    private String thumbnailUrl;

    private List<ProductSpecificationDTO> specifications;

    private List<VariantDTO> variants;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public ProductDetailsDTO() {
    }

    public ProductDetailsDTO(
            Long id,
            String name,
            String brand,
            String category,
            String description,
            String thumbnailUrl,
            List<ProductSpecificationDTO> specifications,
            List<VariantDTO> variants
    ) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.specifications = specifications;
        this.variants = variants;
    }

    // ============================================================
    // GETTERS
    // ============================================================

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

    public String getDescription() {
        return description;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public List<ProductSpecificationDTO> getSpecifications() {
        return specifications;
    }

    public List<VariantDTO> getVariants() {
        return variants;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public void setSpecifications(
            List<ProductSpecificationDTO> specifications
    ) {
        this.specifications = specifications;
    }

    public void setVariants(
            List<VariantDTO> variants
    ) {
        this.variants = variants;
    }
}
