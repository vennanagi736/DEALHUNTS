package org.example.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "product_attribute_value",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {
                "product_id",
                "attribute_id"
            }
        )
    }
)
public class ProductAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    // ATTRIBUTE
    // ============================================================

    @ManyToOne
    @JoinColumn(
        name = "attribute_id",
        nullable = false
    )
    private AttributeDefinition attribute;

    // ============================================================
    // VALUE
    // ============================================================

    @Column(
        name = "attribute_value",
        length = 2000
    )
    private String value;

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public AttributeDefinition getAttribute() {
        return attribute;
    }

    public String getValue() {
        return value;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setAttribute(
            AttributeDefinition attribute
    ) {
        this.attribute = attribute;
    }

    public void setValue(String value) {
        this.value = value;
    }
}