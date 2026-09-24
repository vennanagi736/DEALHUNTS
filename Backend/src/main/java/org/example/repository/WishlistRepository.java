package org.example.repository;

import java.util.List;
import java.util.Optional;

import org.example.entity.Product;
import org.example.entity.User;
import org.example.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository
        extends JpaRepository<Wishlist, Integer> {

    // =========================================================
    // GET USER WISHLIST
    // =========================================================

    List<Wishlist> findByUserOrderByCreatedAtDesc(
        User user
    );


    // =========================================================
    // FIND WISHLIST ITEM
    // =========================================================

    Optional<Wishlist> findByUserAndProduct(
        User user,
        Product product
    );


    // =========================================================
    // CHECK WISHLIST
    // =========================================================

    boolean existsByUserAndProduct(
        User user,
        Product product
    );


    // =========================================================
    // REMOVE FROM WISHLIST
    // =========================================================

    void deleteByUserAndProduct(
        User user,
        Product product
    );
}