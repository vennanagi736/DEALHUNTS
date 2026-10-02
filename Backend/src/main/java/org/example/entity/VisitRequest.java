package org.example.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(
        name = "visit_requests",
        indexes = {
                @Index(name = "idx_visit_product", columnList = "product_id"),
                @Index(name = "idx_visit_vendor", columnList = "vendor_id"),
                @Index(name = "idx_visit_user", columnList = "user_id"),
                @Index(name = "idx_visit_status", columnList = "status"),
                @Index(name = "idx_visit_date", columnList = "visit_date")
        }
)
public class VisitRequest {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // USER / CUSTOMER
    // =========================================================

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 255)
    private String customerEmail;


    // =========================================================
    // PRODUCT
    // =========================================================

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Transient
    private String productName;

    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "color_id")
    private Long colorId;

    @Column(name = "variant", length = 255)
    private String variant;

    @Column(name = "color", length = 255)
    private String color;


    // =========================================================
    // VENDOR
    // =========================================================

    @Column(name = "vendor_id", nullable = false)
    private Long vendorId;


    // =========================================================
    // VISIT DETAILS
    // =========================================================

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "visit_time", nullable = false)
    private LocalTime visitTime;


    // =========================================================
    // STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private VisitRequestStatus status = VisitRequestStatus.PENDING;


    // =========================================================
    // AUDIT TIMESTAMPS
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    // =========================================================
    // JPA CALLBACKS
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = VisitRequestStatus.PENDING;
        }
    }


    @PreUpdate
    protected void onUpdate() {

        this.updatedAt = LocalDateTime.now();
    }


    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public VisitRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
    return productName;
}
    public void setProductName(String productName) {
    this.productName = productName;
}    

    public Long getVariantId() {
        return variantId;
    }

    public Long getColorId() {
        return colorId;
    }

    public String getVariant() {
        return variant;
    }

    public String getColor() {
        return color;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public LocalTime getVisitTime() {
        return visitTime;
    }

    public VisitRequestStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public void setColorId(Long colorId) {
        this.colorId = colorId;
    }

    public void setVariant(String variant) {
        this.variant = variant;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public void setVisitTime(LocalTime visitTime) {
        this.visitTime = visitTime;
    }

    public void setStatus(VisitRequestStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}