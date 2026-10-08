package org.example.entity;

import java.math.BigDecimal;
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

@Entity
@Table(name = "todays_best_deals")
public class TodaysBestDeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // PRODUCT
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // ============================================================
    // DEAL INFORMATION
    // ============================================================

    @Column(name = "deal_title", nullable = false, length = 255)
    private String dealTitle;

    @Column(
        name = "original_price",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal originalPrice = BigDecimal.ZERO;

    @Column(
        name = "discount",
        precision = 5,
        scale = 2,
        nullable = false
    )
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(
        name = "deal_price",
        precision = 12,
        scale = 2,
        nullable = false
    )
    private BigDecimal dealPrice = BigDecimal.ZERO;

    // ============================================================
    // PRIORITY
    // ============================================================

    @Column(nullable = false)
    private Integer priority = 1;

    // ============================================================
    // DATE RANGE
    // ============================================================

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public String getDealTitle() {
        return dealTitle;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public BigDecimal getDealPrice() {
        return dealPrice;
    }

    public Integer getPriority() {
        return priority;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setDealTitle(String dealTitle) {
        this.dealTitle = dealTitle;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public void setDealPrice(BigDecimal dealPrice) {
        this.dealPrice = dealPrice;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }
}