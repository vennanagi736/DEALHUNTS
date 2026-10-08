package org.example.dto;

public class AvailableNearYouResponseDTO {

    private Long productId;
    private String productName;

    private int vendorId;
    private String vendorName;

    private Integer stock;

    private Double distanceKm;

    private String distanceRange;

    private String availability;

    public AvailableNearYouResponseDTO() {
    }

    public AvailableNearYouResponseDTO(
            Long productId,
            String productName,
            int vendorId,
            String vendorName,
            Integer stock,
            Double distanceKm,
            String distanceRange,
            String availability
    ) {
        this.productId = productId;
        this.productName = productName;
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.stock = stock;
        this.distanceKm = distanceKm;
        this.distanceRange = distanceRange;
        this.availability = availability;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public int getVendorId() {
        return vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public Integer getStock() {
        return stock;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public String getDistanceRange() {
        return distanceRange;
    }

    public String getAvailability() {
        return availability;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setVendorId(int vendorId) {
        this.vendorId = vendorId;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public void setDistanceRange(String distanceRange) {
        this.distanceRange = distanceRange;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }
}