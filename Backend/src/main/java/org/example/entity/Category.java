package org.example.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // CATEGORY INFORMATION
    // ============================================================

    @Column(
        name = "name",
        nullable = false,
        unique = true,
        length = 100
    )
    private String name;

    private String imageUrl;

    @Column(nullable = false)
    private boolean active = true;

    // ============================================================
    // PARENT CATEGORY
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id")
    @JsonIgnore
    private Category parentCategory;

    // ============================================================
    // CHILD CATEGORIES
    // ============================================================

    @OneToMany(
        mappedBy = "parentCategory"
    )
    @JsonIgnore
    private List<Category> subCategories =
            new ArrayList<>();

    // ============================================================
    // PRODUCTS
    // ============================================================

    @OneToMany(
        mappedBy = "category"
    )
    @JsonIgnore
    private List<Product> products =
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

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isActive() {
        return active;
    }

    public Category getParentCategory() {
        return parentCategory;
    }

    public List<Category> getSubCategories() {
        return subCategories;
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

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setParentCategory(Category parentCategory) {
        this.parentCategory = parentCategory;
    }

    public void setSubCategories(
            List<Category> subCategories
    ) {
        this.subCategories = subCategories;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}