package org.example.dto;

public class InventoryTable {


    private Long productId;

    private Integer variantId;

    private Integer colorId;


    private Double sellingPrice;

    private Integer stock;

    private Double discount;


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



    // GETTERS AND SETTERS


    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }


    public Integer getVariantId() {
        return variantId;
    }

    public void setVariantId(Integer variantId) {
        this.variantId = variantId;
    }


    public Integer getColorId() {
        return colorId;
    }

    public void setColorId(Integer colorId) {
        this.colorId = colorId;
    }


    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }


    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }


    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }


    public String getWarranty() {
        return warranty;
    }

    public void setWarranty(String warranty) {
        this.warranty = warranty;
    }


    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }


    public String getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(String deliveryTime) {
        this.deliveryTime = deliveryTime;
    }


    public Boolean getHomeDelivery() {
        return homeDelivery;
    }

    public void setHomeDelivery(Boolean homeDelivery) {
        this.homeDelivery = homeDelivery;
    }


    public Boolean getStorePickup() {
        return storePickup;
    }

    public void setStorePickup(Boolean storePickup) {
        this.storePickup = storePickup;
    }


    public Boolean getCod() {
        return cod;
    }

    public void setCod(Boolean cod) {
        this.cod = cod;
    }


    public Boolean getEmi() {
        return emi;
    }

    public void setEmi(Boolean emi) {
        this.emi = emi;
    }


    public Boolean getExchange() {
        return exchange;
    }

    public void setExchange(Boolean exchange) {
        this.exchange = exchange;
    }


    public String getOfferTitle() {
        return offerTitle;
    }

    public void setOfferTitle(String offerTitle) {
        this.offerTitle = offerTitle;
    }


    public String getOfferDescription() {
        return offerDescription;
    }

    public void setOfferDescription(String offerDescription) {
        this.offerDescription = offerDescription;
    }


    public String getReturnPolicy() {
        return returnPolicy;
    }

    public void setReturnPolicy(String returnPolicy) {
        this.returnPolicy = returnPolicy;
    }


    public Integer getMinPurchase() {
        return minPurchase;
    }

    public void setMinPurchase(Integer minPurchase) {
        this.minPurchase = minPurchase;
    }


    public Integer getMaxPurchase() {
        return maxPurchase;
    }

    public void setMaxPurchase(Integer maxPurchase) {
        this.maxPurchase = maxPurchase;
    }

}