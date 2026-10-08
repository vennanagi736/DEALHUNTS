package org.example.dto;

public class AvailableNearYouAdminDTO {

    private Long id;
    private Long productId;
    private String productName;

    public AvailableNearYouAdminDTO() {
    }

    public AvailableNearYouAdminDTO(
            Long id,
            Long productId,
            String productName
    ) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }
}