package org.example.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // BASIC PRODUCT INFORMATION
    // ============================================================

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(length = 2000)
    private String description;

    /*
     * This is NOT stored directly in the product table.
     * It is used only for receiving/sending specification data
     * through JSON.
     *
     * Actual specification values are stored in:
     * product_attribute_value
     */
    @Transient
    private Map<String, String> specifications = new LinkedHashMap<>();

    // ============================================================
    // BASE PRICE
    // ============================================================

    @Column(
        name = "base_price",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal basePrice = BigDecimal.ZERO;

    // ============================================================
    // STATUS
    // ============================================================

    @Column(nullable = false)
    private boolean active = true;

    // ============================================================
    // IMAGES
    // ============================================================

    @JsonIgnore
    @OneToMany(
        mappedBy = "product",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Image> images = new ArrayList<>();

    @JsonProperty("thumbnailUrl")
    @Transient
    public String getThumbnailUrl() {

        if (images == null || images.isEmpty()) {
            return null;
        }

        return images.get(0).getThumbnailUrl();
    }

    // ============================================================
    // PRODUCT ATTRIBUTE VALUES
    // ============================================================

    @JsonIgnore
    @OneToMany(
        mappedBy = "product",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<ProductAttributeValue> attributeValues =
            new ArrayList<>();

    // ============================================================
    // VARIANTS
    // ============================================================

    @OneToMany(
        mappedBy = "product",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Variant> variants = new ArrayList<>();

    // ============================================================
    // INVENTORIES
    // ============================================================

    @JsonIgnore
    @OneToMany(
        mappedBy = "product",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Inventory> inventories = new ArrayList<>();

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Brand getBrand() {
        return brand;
    }

    public Category getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public Map<String, String> getSpecifications() {
        return specifications;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public boolean isActive() {
        return active;
    }

    public List<Image> getImages() {
        return images;
    }

    public List<ProductAttributeValue> getAttributeValues() {
        return attributeValues;
    }

    public List<Variant> getVariants() {
        return variants;
    }

    public List<Inventory> getInventories() {
        return inventories;
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

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSpecifications(Map<String, String> specifications) {
        this.specifications = specifications;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    public void setAttributeValues(
            List<ProductAttributeValue> attributeValues
    ) {
        this.attributeValues = attributeValues;
    }

    public void setVariants(List<Variant> variants) {
        this.variants = variants;
    }

    public void setInventories(
            List<Inventory> inventories
    ) {
        this.inventories = inventories;
    }
}
