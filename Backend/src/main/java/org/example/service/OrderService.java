package org.example.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.example.dto.OrderItemResponse;
import org.example.dto.OrderResponse;
import org.example.dto.PlaceOrderItemRequest;
import org.example.dto.PlaceOrderRequest;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.entity.Inventory;
import org.example.entity.Order;
import org.example.entity.OrderItem;
import org.example.entity.Product;
import org.example.entity.User;
import org.example.entity.Vendor;
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

       Supports:

       1. CART CHECKOUT
          request.items == null / empty

       2. DIRECT BUY NOW
          request.items contains inventoryId + quantity

       IMPORTANT:

       One checkout can contain products from multiple vendors.

       Since orders.vendor_id is required, the checkout is split into
       one Order per vendor.

       Example:

       Vendor A:
           Product 1
           Product 2

       Vendor B:
           Product 3

       Creates:

           Order #101 -> Vendor A
           Order #102 -> Vendor B
    ============================================================ */

    @Transactional
    public List<OrderResponse> placeOrder(
            String email,
            PlaceOrderRequest request
    ) {

        /* ========================================================
           USER
        ======================================================== */

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        /* ========================================================
           REQUEST VALIDATION
        ======================================================== */

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

        /* ========================================================
           DETERMINE ORDER TYPE
        ======================================================== */

        boolean directBuyNow =
                request.getItems() != null &&
                !request.getItems().isEmpty();

        /* ========================================================
           GROUP ITEMS BY VENDOR
        ======================================================== */

        Map<Long, VendorOrderGroup> vendorGroups =
                new LinkedHashMap<>();

        /* ========================================================
           DIRECT BUY NOW
        ======================================================== */

        if (directBuyNow) {

            for (PlaceOrderItemRequest itemRequest
                    : request.getItems()) {

                if (itemRequest == null) {
                    throw new RuntimeException(
                            "Invalid order item"
                    );
                }

                Long inventoryId =
                        itemRequest.getInventoryId();

                Integer quantity =
                        itemRequest.getQuantity();

                if (inventoryId == null) {
                    throw new RuntimeException(
                            "Inventory ID is required"
                    );
                }

                if (quantity == null ||
                        quantity <= 0) {

                    throw new RuntimeException(
                            "Invalid order quantity"
                    );
                }

                /* =================================================
                   LOAD INVENTORY
                ================================================= */

                Inventory inventory =
                        inventoryRepository
                                .findById(inventoryId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Inventory not found for ID: "
                                                        + inventoryId
                                        )
                                );

                /* =================================================
                   PRODUCT
                ================================================= */

                Product product =
                        inventory.getProduct();

                if (product == null) {
                    throw new RuntimeException(
                            "Product not found for inventory ID: "
                                    + inventoryId
                    );
                }

                /* =================================================
                   VENDOR
                ================================================= */

                Vendor inventoryVendor =
                        inventory.getVendor();

                if (inventoryVendor == null) {
                    throw new RuntimeException(
                            "Vendor not found for inventory ID: "
                                    + inventoryId
                    );
                }

                /* =================================================
                   VALIDATE STOCK
                ================================================= */

                validateStock(
                        inventory,
                        quantity
                );

                /* =================================================
                   ADD TO VENDOR GROUP
                ================================================= */

                Long vendorId =
                        Long.valueOf(inventoryVendor.getId());

                VendorOrderGroup group =
                        vendorGroups.get(vendorId);

                if (group == null) {

                    group =
                            new VendorOrderGroup(
                                    inventoryVendor
                            );

                    vendorGroups.put(
                            vendorId,
                            group
                    );
                }

                group.addItem(
                        inventory,
                        quantity
                );
            }

        }

        /* ========================================================
           CART CHECKOUT
        ======================================================== */

        else {

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

            /* ====================================================
               PROCESS CART ITEMS
            ==================================================== */

            for (CartItem cartItem : cartItems) {

                if (cartItem == null) {
                    throw new RuntimeException(
                            "Invalid cart item"
                    );
                }

                Inventory inventory =
                        cartItem.getInventory();

                if (inventory == null) {
                    throw new RuntimeException(
                            "Inventory not found for cart item"
                    );
                }

                Integer quantity =
                        cartItem.getQuantity();

                if (quantity == null ||
                        quantity <= 0) {

                    throw new RuntimeException(
                            "Invalid cart quantity"
                    );
                }

                /* =================================================
                   VENDOR
                ================================================= */

                Vendor inventoryVendor =
                        inventory.getVendor();

                if (inventoryVendor == null) {
                    throw new RuntimeException(
                            "Vendor not found for inventory ID: "
                                    + inventory.getId()
                    );
                }

                /* =================================================
                   VALIDATE STOCK
                ================================================= */

                validateStock(
                        inventory,
                        quantity
                );

                /* =================================================
                   ADD TO VENDOR GROUP
                ================================================= */

                Long vendorId =
                        Long.valueOf(inventoryVendor.getId());

                VendorOrderGroup group =
                        vendorGroups.get(vendorId);

                if (group == null) {

                    group =
                            new VendorOrderGroup(
                                    inventoryVendor
                            );

                    vendorGroups.put(
                            vendorId,
                            group
                    );
                }

                group.addItem(
                        inventory,
                        quantity
                );
            }
        }

        /* ========================================================
           VALIDATE GROUPS
        ======================================================== */

        if (vendorGroups.isEmpty()) {
            throw new RuntimeException(
                    "No products available to place order"
            );
        }

        /* ========================================================
           CREATE ORDERS
        ======================================================== */

        List<OrderResponse> responses =
                new ArrayList<>();

        for (VendorOrderGroup group
                : vendorGroups.values()) {

            /* ====================================================
               CREATE ORDER
            ==================================================== */

            Order order =
                    new Order();

            order.setUser(
                    user
            );

            order.setVendor(
                    group.getVendor()
            );

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

            /* ====================================================
               TOTALS
            ==================================================== */

            BigDecimal subtotal =
                    BigDecimal.ZERO;

            BigDecimal discount =
                    BigDecimal.ZERO;

            List<OrderItem> orderItems =
                    new ArrayList<>();

            /* ====================================================
               CREATE ORDER ITEMS
            ==================================================== */

            for (VendorOrderItem vendorItem
                    : group.getItems()) {

                Inventory inventory =
                        vendorItem.getInventory();

                Integer quantity =
                        vendorItem.getQuantity();

                /* =================================================
                   CREATE ORDER ITEM
                ================================================= */

                OrderItem orderItem =
                        createOrderItem(
                                order,
                                inventory,
                                quantity
                        );

                orderItems.add(
                        orderItem
                );

                /* =================================================
                   TOTALS
                ================================================= */

                BigDecimal originalPrice =
                        inventory
                                .getColor()
                                .getPrice();

                BigDecimal discountPercent =
                        getDiscountPercent(
                                inventory
                        );

                BigDecimal discountPerUnit =
                        calculateDiscountPerUnit(
                                originalPrice,
                                discountPercent
                        );

                BigDecimal itemSubtotal =
                        originalPrice.multiply(
                                BigDecimal.valueOf(quantity)
                        );

                BigDecimal itemDiscount =
                        discountPerUnit.multiply(
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
            }

            /* ====================================================
               DELIVERY
            ==================================================== */

            BigDecimal delivery =
                    BigDecimal.ZERO;

            /* ====================================================
               FINAL TOTAL
            ==================================================== */

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

            /* ====================================================
               SAVE ORDER
            ==================================================== */

            Order savedOrder =
                    orderRepository.save(
                            order
                    );

            /* ====================================================
               SAVE ORDER ITEMS + REDUCE STOCK
            ==================================================== */

            for (OrderItem orderItem
                    : orderItems) {

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

            /* ====================================================
               RESPONSE
            ==================================================== */

            responses.add(
                    buildOrderResponse(
                            savedOrder
                    )
            );
        }

        /* ========================================================
           CLEAR CART ONLY FOR CART CHECKOUT
        ======================================================== */

        if (!directBuyNow) {

            Cart cart =
                    cartRepository
                            .findByUser(user)
                            .orElse(null);

            if (cart != null) {

                cartItemRepository.deleteByCart(
                        cart
                );
            }
        }

        /* ========================================================
           RETURN ALL CREATED ORDERS
        ======================================================== */

        return responses;
    }

    /* ============================================================
       VALIDATE STOCK
    ============================================================ */

    private void validateStock(
            Inventory inventory,
            Integer quantity
    ) {

        Integer stock =
                inventory.getStock();

        if (stock == null ||
                stock <= 0) {

            throw new RuntimeException(
                    "Product is out of stock"
            );
        }

        if (quantity > stock) {

            throw new RuntimeException(
                    "Insufficient stock for product"
            );
        }

        /* ========================================================
           MIN PURCHASE
        ======================================================== */

        Integer minPurchase =
                inventory.getMinPurchase();

        if (minPurchase != null &&
                quantity < minPurchase) {

            throw new RuntimeException(
                    "Minimum purchase quantity is "
                            + minPurchase
            );
        }

        /* ========================================================
           MAX PURCHASE
        ======================================================== */

        Integer maxPurchase =
                inventory.getMaxPurchase();

        if (maxPurchase != null &&
                quantity > maxPurchase) {

            throw new RuntimeException(
                    "Maximum purchase quantity is "
                            + maxPurchase
        );
        }

        /* ========================================================
           COLOR
        ======================================================== */

        if (inventory.getColor() == null) {

            throw new RuntimeException(
                    "Color not found for inventory"
            );
        }

        /* ========================================================
           PRICE
        ======================================================== */

        BigDecimal price =
                inventory
                        .getColor()
                        .getPrice();

        if (price == null ||
                price.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            throw new RuntimeException(
                    "Product color price is invalid"
            );
        }
    }

    /* ============================================================
       GET DISCOUNT
    ============================================================ */

    private BigDecimal getDiscountPercent(
            Inventory inventory
    ) {

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

        return discountPercent;
    }

    /* ============================================================
       CALCULATE DISCOUNT PER UNIT
    ============================================================ */

    private BigDecimal calculateDiscountPerUnit(
            BigDecimal originalPrice,
            BigDecimal discountPercent
    ) {

        return originalPrice
                .multiply(discountPercent)
                .divide(
                        new BigDecimal("100"),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    /* ============================================================
       CREATE ORDER ITEM
    ============================================================ */

    private OrderItem createOrderItem(
            Order order,
            Inventory inventory,
            Integer quantity
    ) {

        Product product =
                inventory.getProduct();

        BigDecimal originalPrice =
                inventory
                        .getColor()
                        .getPrice();

        BigDecimal discountPercent =
                getDiscountPercent(
                        inventory
                );

        BigDecimal discountPerUnit =
                calculateDiscountPerUnit(
                        originalPrice,
                        discountPercent
                );

        BigDecimal finalPrice =
                originalPrice.subtract(
                        discountPerUnit
                );

        BigDecimal itemTotal =
                finalPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        OrderItem orderItem =
                new OrderItem();

        orderItem.setOrder(
                order
        );

        orderItem.setInventory(
                inventory
        );

        orderItem.setProduct(
                product
        );

        /* ========================================================
           VENDOR
        ======================================================== */

        if (inventory.getVendor() == null) {

            throw new RuntimeException(
                    "Vendor not found for inventory ID: "
                            + inventory.getId()
            );
        }

        /*
         * Vendor always comes from Inventory.
         * Never trust vendor information from frontend.
         */
        orderItem.setVendor(
                inventory.getVendor()
        );

        /* ========================================================
           QUANTITY
        ======================================================== */

        orderItem.setQuantity(
                quantity
        );

        /* ========================================================
           FINAL PRICE
        ======================================================== */

        orderItem.setPrice(
                finalPrice
        );

        /* ========================================================
           DISCOUNT
        ======================================================== */

        orderItem.setDiscount(
                discountPercent
        );

        /* ========================================================
           TOTAL
        ======================================================== */

        orderItem.setTotal(
                itemTotal
        );

        /* ========================================================
           VARIANT
        ======================================================== */

        if (inventory.getVariant() != null) {

            orderItem.setVariantName(
                    inventory
                            .getVariant()
                            .getName()
            );
        }

        /* ========================================================
           COLOR
        ======================================================== */

        orderItem.setColorName(
                inventory
                        .getColor()
                        .getName()
        );

        return orderItem;
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
                    buildOrderResponse(
                            order
                    )
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

        if (order.getUser() == null ||
                !order.getUser()
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

        /* ========================================================
           ORDER ITEMS
        ======================================================== */

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
                        product.getBrand() != null
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

    /* ============================================================
       VENDOR ORDER GROUP

       Holds all cart/direct-buy items belonging to one vendor.
    ============================================================ */

    private static class VendorOrderGroup {

        private final Vendor vendor;

        private final List<VendorOrderItem> items =
                new ArrayList<>();

        VendorOrderGroup(
                Vendor vendor
        ) {
            this.vendor = vendor;
        }

        void addItem(
                Inventory inventory,
                Integer quantity
        ) {

            items.add(
                    new VendorOrderItem(
                            inventory,
                            quantity
                    )
            );
        }

        Vendor getVendor() {
            return vendor;
        }

        List<VendorOrderItem> getItems() {
            return items;
        }
    }

    /* ============================================================
       VENDOR ORDER ITEM
    ============================================================ */

    private static class VendorOrderItem {

        private final Inventory inventory;

        private final Integer quantity;

        VendorOrderItem(
                Inventory inventory,
                Integer quantity
        ) {
            this.inventory = inventory;
            this.quantity = quantity;
        }

        Inventory getInventory() {
            return inventory;
        }

        Integer getQuantity() {
            return quantity;
        }
    }
}
