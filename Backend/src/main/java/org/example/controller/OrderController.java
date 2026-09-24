package org.example.controller;

import java.util.List;

import org.example.dto.OrderResponse;
import org.example.dto.PlaceOrderRequest;
import org.example.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/order")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(
            OrderService orderService
    ) {
        this.orderService = orderService;
    }

    /* ============================================================
       PLACE ORDER
    ============================================================ */

    @PostMapping("/place")
    public ResponseEntity<List<OrderResponse>> placeOrder(
            Authentication authentication,
            @RequestBody PlaceOrderRequest request
    ) {

        String email =
                authentication.getName();

        List<OrderResponse> responses =
                orderService.placeOrder(
                        email,
                        request
                );

        return ResponseEntity.ok(
                responses
        );
    }

    /* ============================================================
       GET MY ORDERS
    ============================================================ */

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        List<OrderResponse> orders =
                orderService.getUserOrders(
                        email
                );

        return ResponseEntity.ok(
                orders
        );
    }

    /* ============================================================
       GET SINGLE ORDER
    ============================================================ */

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {

        String email =
                authentication.getName();

        OrderResponse response =
                orderService.getOrder(
                        email,
                        orderId
                );

        return ResponseEntity.ok(
                response
        );
    }
}