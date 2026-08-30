package org.example.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.example.dto.OrderItemResponse;
import org.example.dto.OrderResponse;
import org.example.dto.PlaceOrderRequest;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.entity.Inventory;
import org.example.entity.Order;
import org.example.entity.OrderItem;
import org.example.entity.Product;
import org.example.entity.User;
import org.example.repository.CartItemRepository;
import org.example.repository.CartRepository;
import org.example.repository.InventoryRepository;
import org.example.repository.OrderItemRepository;
import org.example.repository.OrderRepository;
import org.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            InventoryRepository inventoryRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
    }

    /* ============================================================
       PLACE ORDER
    ============================================================ */

    @Transactional
    public OrderResponse placeOrder(
            String email,
            PlaceOrderRequest request
    ) {

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        if (request == null) {
            throw new RuntimeException(
                    "Order request is required"
            );
        }

        if (request.getPaymentMethod() == null ||
                request.getPaymentMethod().trim().isEmpty()) {

            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        if (request.getDeliveryAddress() == null ||
                request.getDeliveryAddress().trim().isEmpty()) {

            throw new RuntimeException(
                    "Delivery address is required"
            );
        }

        /* --------------------------------------------------------
           FIND CART
        -------------------------------------------------------- */

        Cart cart =
                cartRepository
                        .findByUser(user)
                        .orElse(null);

        if (cart == null) {
            throw new RuntimeException(
                    "Cart is empty"
            );
        }

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        if (cartItems == null ||
                cartItems.isEmpty()) {

            throw new RuntimeException(
                    "Cart is empty"
            );
        }

        /* --------------------------------------------------------
           CREATE ORDER
        -------------------------------------------------------- */

        Order order =
                new Order();

        order.setUser(user);

        order.setPaymentMethod(
                request.getPaymentMethod()
        );

        order.setPaymentStatus(
                "PENDING"
        );

        order.setOrderStatus(
                "PLACED"
        );

        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );

        order.setCity(
                request.getCity()
        );

        order.setState(
                request.getState()
        );

        order.setPincode(
                request.getPincode()
        );

        /* --------------------------------------------------------
           TOTALS
        -------------------------------------------------------- */

        BigDecimal subtotal =
                BigDecimal.ZERO;

        BigDecimal discount =
                BigDecimal.ZERO;

        List<OrderItem> orderItems =
                new ArrayList<>();

        /* ========================================================
           CART ITEMS
        ======================================================== */

        for (CartItem cartItem : cartItems) {

            Inventory inventory =
                    cartItem.getInventory();

            if (inventory == null) {
                throw new RuntimeException(
                        "Inventory not found for cart item"
                );
            }

            Product product =
                    inventory.getProduct();

            if (product == null) {
                throw new RuntimeException(
                        "Product not found"
                );
            }

            /* ----------------------------------------------------
               STOCK
            ---------------------------------------------------- */

            Integer stock =
                    inventory.getStock();

            Integer quantity =
                    cartItem.getQuantity();

            if (stock == null ||
                    stock <= 0) {

                throw new RuntimeException(
                        "Product is out of stock"
                );
            }

            if (quantity == null ||
                    quantity <= 0) {

                throw new RuntimeException(
                        "Invalid cart quantity"
                );
            }

            if (quantity > stock) {

                throw new RuntimeException(
                        "Insufficient stock for product"
                );
            }

            /* ----------------------------------------------------
               COLOR
            ---------------------------------------------------- */

            if (inventory.getColor() == null) {

                throw new RuntimeException(
                        "Color not found for inventory"
                );
            }

            /* ----------------------------------------------------
               PRICE FROM COLOR
            ---------------------------------------------------- */

            BigDecimal originalPrice =
                    inventory
                            .getColor()
                            .getPrice();

            if (originalPrice == null ||
                    originalPrice.compareTo(
                            BigDecimal.ZERO
                    ) <= 0) {

                throw new RuntimeException(
                        "Product color price is invalid"
                );
            }

            /* ----------------------------------------------------
               DISCOUNT
            ---------------------------------------------------- */

            BigDecimal discountPercent =
                    inventory.getDiscount() == null
                            ? BigDecimal.ZERO
                            : inventory.getDiscount();

            if (discountPercent.compareTo(
                    BigDecimal.ZERO
            ) < 0 ||
                discountPercent.compareTo(
                        new BigDecimal("100")
                ) >= 0) {

                throw new RuntimeException(
                        "Invalid discount percentage"
                );
            }

            /* ----------------------------------------------------
               DISCOUNT PER UNIT
            ---------------------------------------------------- */

            BigDecimal discountPerUnit =
                    originalPrice
                            .multiply(discountPercent)
                            .divide(
                                    new BigDecimal("100"),
                                    2,
                                    RoundingMode.HALF_UP
                            );

            /* ----------------------------------------------------
               FINAL PRICE PER UNIT
            ---------------------------------------------------- */

            BigDecimal finalPrice =
                    originalPrice.subtract(
                            discountPerUnit
                    );

            /* ----------------------------------------------------
               ITEM SUBTOTAL
            ---------------------------------------------------- */

            BigDecimal itemSubtotal =
                    originalPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            /* ----------------------------------------------------
               ITEM DISCOUNT
            ---------------------------------------------------- */

            BigDecimal itemDiscount =
                    discountPerUnit.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            /* ----------------------------------------------------
               ITEM TOTAL
            ---------------------------------------------------- */

            BigDecimal itemTotal =
                    finalPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            subtotal =
                    subtotal.add(
                            itemSubtotal
                    );

            discount =
                    discount.add(
                            itemDiscount
                    );

            /* ----------------------------------------------------
               ORDER ITEM
            ---------------------------------------------------- */

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(order);

            orderItem.setInventory(
                    inventory
            );

            orderItem.setProduct(
                    product
            );

            orderItem.setVendor(
                    inventory.getVendor()
            );

            orderItem.setQuantity(
                    quantity
            );

            /*
             * Final price paid per unit.
             */
            orderItem.setPrice(
                    finalPrice
            );

            orderItem.setDiscount(
                    discountPercent
            );

            orderItem.setTotal(
                    itemTotal
            );

            /* ----------------------------------------------------
               VARIANT
            ---------------------------------------------------- */

            if (inventory.getVariant() != null) {

                orderItem.setVariantName(
                        inventory
                                .getVariant()
                                .getName()
                );
            }

            /* ----------------------------------------------------
               COLOR
            ---------------------------------------------------- */

            orderItem.setColorName(
                    inventory
                            .getColor()
                            .getName()
            );

            orderItems.add(
                    orderItem
            );
        }

        /* --------------------------------------------------------
           DELIVERY
        -------------------------------------------------------- */

        BigDecimal delivery =
                BigDecimal.ZERO;

        /* --------------------------------------------------------
           FINAL TOTAL
        -------------------------------------------------------- */

        BigDecimal total =
                subtotal
                        .subtract(discount)
                        .add(delivery);

        order.setSubtotal(
                subtotal
        );

        order.setDiscount(
                discount
        );

        order.setDeliveryCharge(
                delivery
        );

        order.setTotal(
                total
        );

        /* --------------------------------------------------------
           SAVE ORDER
        -------------------------------------------------------- */

        Order savedOrder =
                orderRepository.save(order);

        /* --------------------------------------------------------
           SAVE ITEMS + REDUCE STOCK
        -------------------------------------------------------- */

        for (OrderItem orderItem : orderItems) {

            orderItem.setOrder(
                    savedOrder
            );

            orderItemRepository.save(
                    orderItem
            );

            Inventory inventory =
                    orderItem.getInventory();

            int remainingStock =
                    inventory.getStock()
                            -
                    orderItem.getQuantity();

            inventory.setStock(
                    remainingStock
            );

            inventoryRepository.save(
                    inventory
            );
        }

        /* --------------------------------------------------------
           CLEAR CART
        -------------------------------------------------------- */

        cartItemRepository.deleteByCart(
                cart
        );

        return buildOrderResponse(
                savedOrder
        );
    }

    /* ============================================================
       GET USER ORDERS
    ============================================================ */

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(
            String email
    ) {

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        List<Order> orders =
                orderRepository
                        .findByUserOrderByCreatedAtDesc(
                                user
                        );

        List<OrderResponse> responses =
                new ArrayList<>();

        for (Order order : orders) {

            responses.add(
                    buildOrderResponse(order)
            );
        }

        return responses;
    }

    /* ============================================================
       GET SINGLE ORDER
    ============================================================ */

    @Transactional(readOnly = true)
    public OrderResponse getOrder(
            String email,
            Long orderId
    ) {

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        if (!order.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot access this order"
            );
        }

        return buildOrderResponse(
                order
        );
    }

    /* ============================================================
       BUILD ORDER RESPONSE
    ============================================================ */

    private OrderResponse buildOrderResponse(
            Order order
    ) {

        OrderResponse response =
                new OrderResponse();

        response.setOrderId(
                order.getId()
        );

        response.setSubtotal(
                order.getSubtotal()
        );

        response.setDiscount(
                order.getDiscount()
        );

        response.setDeliveryCharge(
                order.getDeliveryCharge()
        );

        response.setTotal(
                order.getTotal()
        );

        response.setPaymentMethod(
                order.getPaymentMethod()
        );

        response.setPaymentStatus(
                order.getPaymentStatus()
        );

        response.setOrderStatus(
                order.getOrderStatus()
        );

        response.setDeliveryAddress(
                order.getDeliveryAddress()
        );

        response.setCity(
                order.getCity()
        );

        response.setState(
                order.getState()
        );

        response.setPincode(
                order.getPincode()
        );

        response.setCreatedAt(
                order.getCreatedAt()
        );

        List<OrderItem> items =
                orderItemRepository
                        .findByOrder(order);

        List<OrderItemResponse> itemResponses =
                new ArrayList<>();

        for (OrderItem item : items) {

            OrderItemResponse itemResponse =
                    new OrderItemResponse();

            itemResponse.setId(
                    item.getId()
            );

            Product product =
                    item.getProduct();

            if (product != null) {

                itemResponse.setProductId(
                        product.getId()
                );

                itemResponse.setProductName(
                        product.getName()
                );

                itemResponse.setBrand(
                        product.getBrand()!=null
                        ? product.getBrand().getName()
                        : null
                );
            }

            if (item.getVendor() != null) {

                itemResponse.setVendorName(
                        item.getVendor()
                                .getShopName()
                );
            }

            itemResponse.setQuantity(
                    item.getQuantity()
            );

            /*
             * Final price paid per unit.
             */
            itemResponse.setPrice(
                    item.getPrice()
            );

            itemResponse.setDiscount(
                    item.getDiscount()
            );

            itemResponse.setTotal(
                    item.getTotal()
            );

            itemResponse.setVariantName(
                    item.getVariantName()
            );

            itemResponse.setColorName(
                    item.getColorName()
            );

            itemResponses.add(
                    itemResponse
            );
        }

        response.setItems(
                itemResponses
        );

        return response;
    }
}