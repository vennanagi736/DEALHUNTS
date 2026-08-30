package org.example.dto;

import java.math.BigDecimal;

public class InventoryTable {

    private Long productId;

    private Long variantId;

    private Long colorId;

    private Integer stock;

    private BigDecimal discount;

    private String warranty;

    private String condition;

    private String deliveryTime;

    private Boolean homeDelivery;

    private Boolean storePickup;

    private Boolean cod;

    private Boolean emi;

    private Boolean exchange;

    private String offerTitle;

    private String offerDescription;

    private String returnPolicy;

    private Integer minPurchase;

    private Integer maxPurchase;

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getProductId() {
        return productId;
    }

    public Long getVariantId() {
        return variantId;
    }

    public Long getColorId() {
        return colorId;
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

    public String getCondition() {
        return condition;
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

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public void setColorId(Long colorId) {
        this.colorId = colorId;
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

    public void setCondition(String condition) {
        this.condition = condition;
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