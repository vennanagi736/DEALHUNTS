package org.example.dto;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class VariantDTO {

    private Long id;
    private String name;

    /*
     * Example:
     * {
     *   "RAM": "8GB",
     *   "Storage": "128GB"
     * }
     */
    private Map<String, String> attributeValues = new LinkedHashMap<>();

    private List<ColorDTO> colors;

    public VariantDTO() {
    }

    public VariantDTO(
            Long id,
            String name,
            Map<String, String> attributeValues,
            List<ColorDTO> colors
    ) {
        this.id = id;
        this.name = name;
        this.attributeValues =
                attributeValues != null
                        ? attributeValues
                        : new LinkedHashMap<>();
        this.colors = colors;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, String> getAttributeValues() {
        return attributeValues;
    }

    public void setAttributeValues(Map<String, String> attributeValues) {
        this.attributeValues =
                attributeValues != null
                        ? attributeValues
                        : new LinkedHashMap<>();
    }

    public List<ColorDTO> getColors() {
        return colors;
    }

    public void setColors(List<ColorDTO> colors) {
        this.colors = colors;
    }
}