package org.example.dto;

public class ProductAttributeValueDTO {

    private Long attributeId;
    private String value;

    public ProductAttributeValueDTO() {
    }

    public ProductAttributeValueDTO(
            Long attributeId,
            String value
    ) {
        this.attributeId = attributeId;
        this.value = value;
    }

    public Long getAttributeId() {
        return attributeId;
    }

    public String getValue() {
        return value;
    }

    public void setAttributeId(Long attributeId) {
        this.attributeId = attributeId;
    }

    public void setValue(String value) {
        this.value = value;
    }
}