package org.example.dto;

public class AttributeDefinitionDTO {

    private Long id;

    private Long categoryId;

    private String name;

    private String label;

    private String placeholder;

    private String dataType;

    private String unit;

    private boolean required;

    private boolean comparable;

    private Integer displayOrder;

    private boolean active;

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public String getPlaceholder() {
        return placeholder;
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

    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setPlaceholder(String placeholder) {
        this.placeholder = placeholder;
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
}