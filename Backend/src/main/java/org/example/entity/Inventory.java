package org.example.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // VENDOR
    // ============================================================

    @ManyToOne
    @JoinColumn(
        name = "vendor_id",
        nullable = false
    )
    private Vendor vendor;

    // ============================================================
    // PRODUCT
    // ============================================================

    @ManyToOne
    @JsonIgnore
    @JoinColumn(
        name = "product_id",
        nullable = false
    )
    private Product product;

    // ============================================================
    // VARIANT
    // ============================================================

    @ManyToOne
    @JsonIgnore
    @JoinColumn(
        name = "variant_id"
    )
    private Variant variant;

    // ============================================================
    // COLOR
    // ============================================================

    @ManyToOne
    @JsonIgnore
    @JoinColumn(
        name = "color_id"
    )
    private Color color;

    // ============================================================
    // INVENTORY INFORMATION
    // ============================================================

    @Column(name = "product_condition")
    private String condition;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(
        precision = 5,
        scale = 2
    )
    private BigDecimal discount = BigDecimal.ZERO;

    private String warranty;

    private String deliveryTime;

    private Boolean homeDelivery = false;

    private Boolean storePickup = false;

    private Boolean cod = false;

    private Boolean emi = false;

    private Boolean exchange = false;

    private String offerTitle;

    @Column(length = 1000)
    private String offerDescription;

    private String returnPolicy;

    private Integer minPurchase;

    private Integer maxPurchase;

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public Product getProduct() {
        return product;
    }

    public Variant getVariant() {
        return variant;
    }

    public Color getColor() {
        return color;
    }

    public String getCondition() {
        return condition;
    }

    public Integer getStock() {
        return stock;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public String getWarranty() {
        return warranty;
    }

    public String getDeliveryTime() {
        return deliveryTime;
    }

    public Boolean getHomeDelivery() {
        return homeDelivery;
    }

    public Boolean getStorePickup() {
        return storePickup;
    }

    public Boolean getCod() {
        return cod;
    }

    public Boolean getEmi() {
        return emi;
    }

    public Boolean getExchange() {
        return exchange;
    }

    public String getOfferTitle() {
        return offerTitle;
    }

    public String getOfferDescription() {
        return offerDescription;
    }

    public String getReturnPolicy() {
        return returnPolicy;
    }

    public Integer getMinPurchase() {
        return minPurchase;
    }

    public Integer getMaxPurchase() {
        return maxPurchase;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setVariant(Variant variant) {
        this.variant = variant;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public void setWarranty(String warranty) {
        this.warranty = warranty;
    }

    public void setDeliveryTime(String deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public void setHomeDelivery(Boolean homeDelivery) {
        this.homeDelivery = homeDelivery;
    }

    public void setStorePickup(Boolean storePickup) {
        this.storePickup = storePickup;
    }

    public void setCod(Boolean cod) {
        this.cod = cod;
    }

    public void setEmi(Boolean emi) {
        this.emi = emi;
    }

    public void setExchange(Boolean exchange) {
        this.exchange = exchange;
    }

    public void setOfferTitle(String offerTitle) {
        this.offerTitle = offerTitle;
    }

    public void setOfferDescription(String offerDescription) {
        this.offerDescription = offerDescription;
    }

    public void setReturnPolicy(String returnPolicy) {
        this.returnPolicy = returnPolicy;
    }

    public void setMinPurchase(Integer minPurchase) {
        this.minPurchase = minPurchase;
    }

    public void setMaxPurchase(Integer maxPurchase) {
        this.maxPurchase = maxPurchase;
    }
}