package org.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "cart_item",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "cart_id",
                                "inventory_id"
                        }
                )
        }
)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // CART
    // ============================================================

    @ManyToOne
    @JoinColumn(
            name = "cart_id",
            nullable = false
    )
    private Cart cart;


    // ============================================================
    // INVENTORY
    // ============================================================

    @ManyToOne
    @JoinColumn(
            name = "inventory_id",
            nullable = false
    )
    private Inventory inventory;


    // ============================================================
    // QUANTITY
    // ============================================================

    @Column(nullable = false)
    private Integer quantity = 1;


    // ============================================================
    // GETTERS / SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }


    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}