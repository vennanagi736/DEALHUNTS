package org.example.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "new_arrivals",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_new_arrival_product",
                        columnNames = "product_id"
                )
        }
)
public class NewArrival {

    // ============================================================
    // ID
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // PRODUCT
    // ============================================================

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "product_id",
            nullable = false
    )
    private Product product;


    // ============================================================
    // DISPLAY DATES
    // ============================================================

    @Column(
            name = "display_from_date",
            nullable = false
    )
    private LocalDate displayFromDate;


    @Column(
            name = "display_to_date",
            nullable = false
    )
    private LocalDate displayToDate;


    // ============================================================
    // PRIORITY
    // ============================================================

    @Column(
            nullable = false
    )
    private Integer priority = 1;


    // ============================================================
    // ACTIVE
    // ============================================================

    @Column(
            nullable = false
    )
    private boolean active = true;


    // ============================================================
    // NEW ARRIVAL IMAGE
    // ============================================================

    @Column(
            name = "image_url",
            length = 1000
    )
    private String imageUrl;


    // ============================================================
    // CONSTRUCTORS
    // ============================================================

    public NewArrival() {
    }


    // ============================================================
    // GETTERS / SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }


    public LocalDate getDisplayFromDate() {
        return displayFromDate;
    }

    public void setDisplayFromDate(LocalDate displayFromDate) {
        this.displayFromDate = displayFromDate;
    }


    public LocalDate getDisplayToDate() {
        return displayToDate;
    }

    public void setDisplayToDate(LocalDate displayToDate) {
        this.displayToDate = displayToDate;
    }


    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }


    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }


    // ============================================================
    // IMAGE GETTER / SETTER
    // ============================================================

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}