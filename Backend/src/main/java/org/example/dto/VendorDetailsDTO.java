package org.example.dto;

public class VendorDetailsDTO {

    private Integer id;
    private String fullName;
    private String shopName;
    private String phoneNo;
    private String state;
    private String city;
    private Integer pincode;
    private Double latitude;
    private Double longitude;
    private String address;
    private String email;
    private String role;
    private String status;
    private String locationLink;

    public VendorDetailsDTO() {
    }

    public VendorDetailsDTO(
            Integer id,
            String fullName,
            String shopName,
            String phoneNo,
            String state,
            String city,
            Integer pincode,
            Double latitude,
            Double longitude,
            String address,
            String email,
            String role,
            String status,
            String locationLink
    ) {
        this.id = id;
        this.fullName = fullName;
        this.shopName = shopName;
        this.phoneNo = phoneNo;
        this.state = state;
        this.city = city;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.email = email;
        this.role = role;
        this.status = status;
        this.locationLink = locationLink;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Integer getPincode() {
        return pincode;
    }

    public void setPincode(Integer pincode) {
        this.pincode = pincode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocationLink() {
        return locationLink;
    }

    public void setLocationLink(String locationLink) {
        this.locationLink = locationLink;
    }
}