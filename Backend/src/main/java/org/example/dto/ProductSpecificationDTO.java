package org.example.dto;

public class ProductSpecificationDTO {

    private Long attributeId;
    private String name;
    private String label;
    private String value;
    private String unit;

    // ============================================================
    // CONSTRUCTORS
    // ============================================================

    public ProductSpecificationDTO() {
    }

    public ProductSpecificationDTO(
            Long attributeId,
            String name,
            String label,
            String value,
            String unit
    ) {
        this.attributeId = attributeId;
        this.name = name;
        this.label = label;
        this.value = value;
        this.unit = unit;
    }

    public ProductSpecificationDTO(
            String name,
            String label,
            String value,
            String unit
    ) {
        this.name = name;
        this.label = label;
        this.value = value;
        this.unit = unit;
    }

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getAttributeId() {
        return attributeId;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public String getValue() {
        return value;
    }

    public String getUnit() {
        return unit;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setAttributeId(Long attributeId) {
        this.attributeId = attributeId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}