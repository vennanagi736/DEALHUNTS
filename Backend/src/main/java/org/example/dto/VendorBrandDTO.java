package org.example.dto;

public class VendorBrandDTO {

    private Long id;
    private BrandDTO brand;

    public VendorBrandDTO() {
    }

    public VendorBrandDTO(Long id, Long brandId, String brandName) {
        this.id = id;
        this.brand = new BrandDTO(brandId, brandName);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BrandDTO getBrand() {
        return brand;
    }

    public void setBrand(BrandDTO brand) {
        this.brand = brand;
    }

    public static class BrandDTO {

        private Long id;
        private String name;

        public BrandDTO() {
        }

        public BrandDTO(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}