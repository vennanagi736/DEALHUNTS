package org.example.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "color")
public class Color {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // COLOR INFORMATION
    // ============================================================

    @Column(nullable = false)
    private String name;

    @Column(name = "hex_code")
    private String hexCode;


    // ============================================================
    // PRICE
    // ============================================================

    @Column(
        precision = 12,
        scale = 2
    )
    private BigDecimal price;


    // ============================================================
    // PRODUCT
    // ============================================================

    @ManyToOne
    @JsonIgnore
    @JoinColumn(
        name = "product_id",
        nullable = false
    )
    private Product product;


    // ============================================================
    // VARIANT
    // ============================================================

    @ManyToOne
    @JsonIgnore
    @JoinColumn(
        name = "variant_id",
        nullable = false
    )
    private Variant variant;


    // ============================================================
    // GETTERS
    // ============================================================

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

    public Product getProduct() {
        return product;
    }

    public Variant getVariant() {
        return variant;
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

    public void setHexCode(String hexCode) {
        this.hexCode = hexCode;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setVariant(Variant variant) {
        this.variant = variant;
    }
}