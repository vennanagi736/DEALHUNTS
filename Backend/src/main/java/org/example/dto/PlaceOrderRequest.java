package org.example.dto;

import java.util.List;

public class PlaceOrderRequest {

    private String paymentMethod;

    private String deliveryAddress;

    private String city;

    private String state;

    private String pincode;

    // Used for direct Buy Now
    private List<PlaceOrderItemRequest> items;

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public List<PlaceOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<PlaceOrderItemRequest> items) {
        this.items = items;
    }
}