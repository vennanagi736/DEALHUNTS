package org.example.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "attribute_definition",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_category_attribute",
            columnNames = {
                "category_id",
                "attribute_name"
            }
        )
    }
)
public class AttributeDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // CATEGORY
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "category_id",
        nullable = false
    )
    @JsonIgnore
    private Category category;

    // ============================================================
    // ATTRIBUTE INFORMATION
    // ============================================================

    @Column(
        name = "attribute_name",
        nullable = false,
        length = 100
    )
    private String name;

    @Column(
        nullable = false,
        length = 100
    )
    private String label;

    @Column(
        name = "data_type",
        nullable = false,
        length = 30
    )
    private String dataType;

    @Column(length = 30)
    private String unit;

    @Column(nullable = false)
    private boolean required = false;

    @Column(nullable = false)
    private boolean comparable = true;

    @Column(
        name = "display_order",
        nullable = false
    )
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(length=255)
    private String placeholder;

    // ============================================================
    // PRODUCT ATTRIBUTE VALUES
    // ============================================================

    @JsonIgnore
    @OneToMany(
        mappedBy = "attribute",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<ProductAttributeValue> productValues =
            new ArrayList<>();

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Category getCategory() {
        return category;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public String getDataType() {
        return dataType;
    }

    public String getUnit() {
        return unit;
    }

    public boolean isRequired() {
        return required;
    }

    public boolean isComparable() {
        return comparable;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public boolean isActive() {
        return active;
    }

    public String getPlaceholder() {
    return placeholder;
    }

    public void setPlaceholder(String placeholder) {
        this.placeholder = placeholder;        
    }

    public List<ProductAttributeValue> getProductValues() {
        return productValues;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public void setComparable(boolean comparable) {
        this.comparable = comparable;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setProductValues(
            List<ProductAttributeValue> productValues
    ) {
        this.productValues = productValues;
    }
}