package org.example.controller;

import org.example.dto.AddToCartRequest;
import org.example.dto.CartResponse;
import org.example.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }


    // ============================================================
    // ADD TO CART
    // ============================================================

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            Authentication authentication,
            @RequestBody AddToCartRequest request
    ) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        CartResponse response =
                cartService.addToCart(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // GET CURRENT USER CART
    // ============================================================

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            Authentication authentication
    ) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        CartResponse response =
                cartService.getCart(email);

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // UPDATE QUANTITY
    // ============================================================

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            Authentication authentication,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity
    ) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        CartResponse response =
                cartService.updateQuantity(
                        email,
                        cartItemId,
                        quantity
                );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // REMOVE ITEM
    // ============================================================

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(
            Authentication authentication,
            @PathVariable Long cartItemId
    ) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        CartResponse response =
                cartService.removeItem(
                        email,
                        cartItemId
                );

        return ResponseEntity.ok(response);
    }


    // ============================================================
    // CLEAR CART
    // ============================================================

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(
            Authentication authentication
    ) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        cartService.clearCart(email);

        return ResponseEntity.ok(
                "Cart cleared successfully"
        );
    }
}