package org.example.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "brand")
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "name",
        nullable = false,
        unique = true,
        length = 100
    )
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    // ============================================================
    // PRODUCTS
    // ============================================================

    @JsonIgnore
    @OneToMany(
        mappedBy = "brand"
    )
    private List<Product> products = new ArrayList<>();

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isActive() {
        return active;
    }

    public List<Product> getProducts() {
        return products;
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

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}