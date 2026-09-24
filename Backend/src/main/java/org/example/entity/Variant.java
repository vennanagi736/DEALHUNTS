package org.example.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "variant")
public class Variant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // VARIANT NAME
    // ============================================================

    private String name;

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
    // VARIANT ATTRIBUTES
    // ============================================================

    @OneToMany(
        mappedBy = "variant",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<VariantAttributeValue> attributeValues =
            new ArrayList<>();

    // ============================================================
    // COLORS
    // ============================================================

    @OneToMany(
        mappedBy = "variant",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Color> colors =
            new ArrayList<>();

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Product getProduct() {
        return product;
    }

    public List<VariantAttributeValue> getAttributeValues() {
        return attributeValues;
    }

    public List<Color> getColors() {
        return colors;
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

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setAttributeValues(
            List<VariantAttributeValue> attributeValues
    ) {

        this.attributeValues.clear();

        if (attributeValues != null) {

            this.attributeValues.addAll(attributeValues);

            for (VariantAttributeValue value :
                    this.attributeValues) {

                value.setVariant(this);
            }
        }
    }

    public void setColors(List<Color> colors) {

        this.colors.clear();

        if (colors != null) {

            this.colors.addAll(colors);

            for (Color color :
                    this.colors) {

                color.setVariant(this);
            }
        }
    }
}
