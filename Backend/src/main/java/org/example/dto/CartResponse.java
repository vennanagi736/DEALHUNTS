package org.example.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {

    private Long cartId;

    private Integer itemCount;

    private BigDecimal subtotal;

    private BigDecimal discount;

    private BigDecimal delivery;

    private BigDecimal total;

    private List<CartItemResponse> items;


    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Integer getItemCount() {
        return itemCount;
    }

    public void setItemCount(Integer itemCount) {
        this.itemCount = itemCount;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getDelivery() {
        return delivery;
    }

    public void setDelivery(BigDecimal delivery) {
        this.delivery = delivery;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }
}