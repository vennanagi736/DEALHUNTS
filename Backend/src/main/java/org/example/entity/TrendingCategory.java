package org.example.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "trending_categories")
public class TrendingCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(
        name = "category_id",
        nullable = false,
        unique = true
    )
    private Category category;


    // ================= CONSTRUCTORS =================

    public TrendingCategory() {
    }

    public TrendingCategory(Category category) {
        this.category = category;
    }


    // ================= GETTERS & SETTERS =================

    public Long getId() {
        return id;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}