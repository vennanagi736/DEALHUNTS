package org.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "variant_attribute_value")
public class VariantAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // VARIANT
    // ============================================================

    @ManyToOne
    @JoinColumn(
        name = "variant_id",
        nullable = false
    )
    private Variant variant;

    // ============================================================
    // ATTRIBUTE DEFINITION
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

    @Column(length = 1000)
    private String value;

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Variant getVariant() {
        return variant;
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

    public void setVariant(Variant variant) {
        this.variant = variant;
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