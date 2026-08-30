package org.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "category_specification")
public class CategorySpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // CATEGORY
    // Example: Mobile Phones, Refrigerators, Washing Machines
    // ============================================================

    @Column(nullable = false, length = 100)
    private String category;

    // ============================================================
    // SPECIFICATION KEY
    // Example: RAM, Storage, Capacity, Door Type
    // ============================================================

    @Column(name = "spec_key", nullable = false, length = 100)
    private String specKey;

    // ============================================================
    // INPUT TYPE
    // Example: text, number, select
    // ============================================================

    @Column(name = "input_type", nullable = false, length = 30)
    private String inputType = "text";

    // ============================================================
    // REQUIRED
    // Whether vendor must enter this specification
    // ============================================================

    @Column(nullable = false)
    private boolean required = false;


    // ============================================================
    // GETTERS / SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    public String getSpecKey() {
        return specKey;
    }

    public void setSpecKey(String specKey) {
        this.specKey = specKey;
    }


    public String getInputType() {
        return inputType;
    }

    public void setInputType(String inputType) {
        this.inputType = inputType;
    }


    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }
}