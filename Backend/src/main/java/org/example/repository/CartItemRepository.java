package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndInventory(
            Cart cart,
            Inventory inventory
    );


    List<CartItem> findByCart(
            Cart cart
    );


    void deleteByCart(
            Cart cart
    );
}