package org.example.controller;

import java.util.List;
import java.util.Map;

import org.example.dto.WishlistDTO;
import org.example.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WishlistController {

    private final WishlistService wishlistService;


    public WishlistController(
        WishlistService wishlistService
    ) {
        this.wishlistService = wishlistService;
    }


    // =========================================================
    // GET MY WISHLIST
    // =========================================================

    @GetMapping
    public ResponseEntity<List<WishlistDTO>> getMyWishlist() {

        return ResponseEntity.ok(
            wishlistService.getMyWishlist()
        );
    }


    // =========================================================
    // ADD
    // =========================================================

    @PostMapping("/add/{productId}")
    public ResponseEntity<WishlistDTO> addToWishlist(
        @PathVariable Long productId
    ) {

        return ResponseEntity.ok(
            wishlistService.addToWishlist(
                productId
            )
        );
    }


    // =========================================================
    // REMOVE
    // =========================================================

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Map<String, String>>
    removeFromWishlist(
        @PathVariable Long productId
    ) {

        wishlistService.removeFromWishlist(
            productId
        );


        return ResponseEntity.ok(
            Map.of(
                "message",
                "Product removed from wishlist"
            )
        );
    }


    // =========================================================
    // CHECK
    // =========================================================

    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>>
    checkWishlist(
        @PathVariable Long productId
    ) {

        boolean exists =
            wishlistService.isInWishlist(
                productId
            );


        return ResponseEntity.ok(
            Map.of(
                "inWishlist",
                exists
            )
        );
    }
}