package org.example.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
@JoinColumn(name = "vendor_id")
private Vendor vendor;

@ManyToOne
@JoinColumn(name="variant_id")
private Variant variant;


@ManyToOne
@JoinColumn(name="color_id")
private Color color;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_condition")
    private String condition;
    private Double sellingPrice;
    private Integer stock;
    private Double discount;

    private String warranty;
    private String deliveryTime;

    private Boolean homeDelivery;
    private Boolean storePickup;

    private Boolean cod;
    private Boolean emi;
    private Boolean exchange;

    private String offerTitle;

    @Column(length = 1000)
    private String offerDescription;

    private String returnPolicy;

    private Integer minPurchase;
    private Integer maxPurchase;

    // -------------------- GETTERS & SETTERS --------------------
    public Vendor getVendor() {
    return vendor;
}

public void setVendor(Vendor vendor) {
    this.vendor = vendor;
}
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public Variant getVariant() {
    return variant;
}

public void setVariant(Variant variant) {
    this.variant = variant;
}


public Color getColor() {
    return color;
}

public void setColor(Color color) {
    this.color = color;
}

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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