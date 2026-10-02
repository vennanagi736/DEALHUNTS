package org.example.dto;

import java.math.BigDecimal;

public class InventoryVendorDTO {

    private Long inventoryId;

    private Integer vendorId;

    private String shopName;

    // ============================================================
    // VENDOR CONTACT / LOCATION
    // ============================================================

    private String phoneNo;

    private String address;

    private String city;

    private String state;

    private Integer pincode;

    private Double latitude;

    private Double longitude;

    // ============================================================
    // PRODUCT / INVENTORY
    // ============================================================

    // Admin-defined product base price
    private BigDecimal basePrice;

    // Calculated price after vendor discount
    private BigDecimal finalPrice;

    private String condition;

    private Integer stock;

    // Vendor-defined discount percentage
    private BigDecimal discount;

    private String warranty;

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
    // CONSTRUCTOR
    // ============================================================

    public InventoryVendorDTO(
            Long inventoryId,
            Integer vendorId,
            String shopName,

            String phoneNo,
            String address,
            String city,
            String state,
            Integer pincode,
            Double latitude,
            Double longitude,

            BigDecimal basePrice,
            BigDecimal finalPrice,
            String condition,
            Integer stock,
            BigDecimal discount,
            String warranty,
            String deliveryTime,
            Boolean homeDelivery,
            Boolean storePickup,
            Boolean cod,
            Boolean emi,
            Boolean exchange,
            String offerTitle,
            String offerDescription,
            String returnPolicy,
            Integer minPurchase,
            Integer maxPurchase
    ) {

        this.inventoryId = inventoryId;
        this.vendorId = vendorId;
        this.shopName = shopName;

        // ========================================================
        // VENDOR CONTACT / LOCATION
        // ========================================================

        this.phoneNo = phoneNo;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;

        this.latitude = latitude;
        this.longitude = longitude;

        // ========================================================
        // INVENTORY
        // ========================================================

        this.basePrice = basePrice;

        this.condition = condition;
        this.stock = stock;

        this.discount = discount != null
                ? discount
                : BigDecimal.ZERO;

        // ========================================================
        // FINAL PRICE
        // ========================================================

        this.finalPrice = finalPrice;

        this.warranty = warranty;
        this.deliveryTime = deliveryTime;

        this.homeDelivery = homeDelivery;
        this.storePickup = storePickup;

        this.cod = cod;
        this.emi = emi;
        this.exchange = exchange;

        this.offerTitle = offerTitle;
        this.offerDescription = offerDescription;

        this.returnPolicy = returnPolicy;

        this.minPurchase = minPurchase;
        this.maxPurchase = maxPurchase;
    }


    // ============================================================
    // GETTERS
    // ============================================================

    public Long getInventoryId() {
        return inventoryId;
    }

    public Integer getVendorId() {
        return vendorId;
    }

    public String getShopName() {
        return shopName;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public Integer getPincode() {
        return pincode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
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
}