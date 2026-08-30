package org.example.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.example.dto.AddToCartRequest;
import org.example.dto.CartItemResponse;
import org.example.dto.CartResponse;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.entity.Color;
import org.example.entity.Inventory;
import org.example.entity.Product;
import org.example.entity.User;
import org.example.repository.CartItemRepository;
import org.example.repository.CartRepository;
import org.example.repository.InventoryRepository;
import org.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            InventoryRepository inventoryRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
    }

    /* ============================================================
       ADD TO CART
    ============================================================ */

    @Transactional
    public CartResponse addToCart(
            String email,
            AddToCartRequest request
    ) {

        if (request == null) {
            throw new RuntimeException(
                    "Cart request is required"
            );
        }

        if (request.getInventoryId() == null) {
            throw new RuntimeException(
                    "Inventory ID is required"
            );
        }

        int quantity =
                request.getQuantity() == null
                        ? 1
                        : request.getQuantity();

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        User user =
                userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        Inventory inventory =
                inventoryRepository
                        .findById(request.getInventoryId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory not found"
                                )
                        );

        if (inventory.getStock() == null ||
                inventory.getStock() <= 0) {

            throw new RuntimeException(
                    "Product is out of stock"
            );
        }

        if (quantity > inventory.getStock()) {

            throw new RuntimeException(
                    "Requested quantity is greater than available stock"
            );
        }

        /* --------------------------------------------------------
           FIND USER CART
        -------------------------------------------------------- */

        Cart cart =
                cartRepository
                        .findByUser(user)
                        .orElseGet(() -> {

                            Cart newCart = new Cart();

                            newCart.setUser(user);

                            return cartRepository.save(newCart);
                        });

        System.out.println(
                "CART ID: " + cart.getId()
        );

        /* --------------------------------------------------------
           FIND EXISTING CART ITEM
        -------------------------------------------------------- */

        CartItem cartItem =
                cartItemRepository
                        .findByCartAndInventory(
                                cart,
                                inventory
                        )
                        .orElse(null);

        /* --------------------------------------------------------
           EXISTING CART ITEM
        -------------------------------------------------------- */

        if (cartItem != null) {

            int newQuantity =
                    cartItem.getQuantity() + quantity;

            if (newQuantity > inventory.getStock()) {

                throw new RuntimeException(
                        "Requested quantity is greater than available stock"
                );
            }

            cartItem.setQuantity(
                    newQuantity
            );
        }

        /* --------------------------------------------------------
           NEW CART ITEM
        -------------------------------------------------------- */

        else {

            cartItem = new CartItem();

            cartItem.setCart(cart);

            cartItem.setInventory(inventory);

            cartItem.setQuantity(quantity);
        }

        System.out.println(
                "SAVING CART ITEM..."
        );

        cartItemRepository.save(
                cartItem
        );

        System.out.println(
                "CART ITEM SAVED"
        );

        System.out.println(
                "CART ITEM ID: " + cartItem.getId()
        );

        return buildCartResponse(cart);
    }


    /* ============================================================
       GET CART
    ============================================================ */

    @Transactional(readOnly = true)
    public CartResponse getCart(
            String email
    ) {

        User user =
                userRepository.findByEmail(email);

        if (user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        Cart cart =
                cartRepository
                        .findByUser(user)
                        .orElse(null);

        /* --------------------------------------------------------
           EMPTY CART
        -------------------------------------------------------- */

        if (cart == null) {

            CartResponse response =
                    new CartResponse();

            response.setCartId(null);

            response.setItemCount(0);

            response.setSubtotal(
                    BigDecimal.ZERO
            );

            response.setDiscount(
                    BigDecimal.ZERO
            );

            response.setDelivery(
                    BigDecimal.ZERO
            );

            response.setTotal(
                    BigDecimal.ZERO
            );

            response.setItems(
                    new ArrayList<>()
            );

            return response;
        }

        return buildCartResponse(cart);
    }


    /* ============================================================
       UPDATE QUANTITY
    ============================================================ */

    @Transactional
    public CartResponse updateQuantity(
            String email,
            Long cartItemId,
            Integer quantity
    ) {

        if (quantity == null ||
                quantity <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        User user =
                userRepository.findByEmail(email);

        if (user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        CartItem cartItem =
                cartItemRepository
                        .findById(cartItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found"
                                )
                        );

        /* --------------------------------------------------------
           VERIFY CART OWNER
        -------------------------------------------------------- */

        if (!cartItem
                .getCart()
                .getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot modify this cart item"
            );
        }

        Inventory inventory =
                cartItem.getInventory();

        /* --------------------------------------------------------
           STOCK VALIDATION
        -------------------------------------------------------- */

        if (inventory.getStock() == null ||
                inventory.getStock() <= 0) {

            throw new RuntimeException(
                    "Product is out of stock"
            );
        }

        if (quantity > inventory.getStock()) {

            throw new RuntimeException(
                    "Requested quantity is greater than available stock"
            );
        }

        cartItem.setQuantity(
                quantity
        );

        cartItemRepository.save(
                cartItem
        );

        return buildCartResponse(
                cartItem.getCart()
        );
    }


    /* ============================================================
       REMOVE CART ITEM
    ============================================================ */

    @Transactional
    public CartResponse removeItem(
            String email,
            Long cartItemId
    ) {

        User user =
                userRepository.findByEmail(email);

        if (user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        CartItem cartItem =
                cartItemRepository
                        .findById(cartItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found"
                                )
                        );

        /* --------------------------------------------------------
           VERIFY CART OWNER
        -------------------------------------------------------- */

        if (!cartItem
                .getCart()
                .getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot remove this cart item"
            );
        }

        Cart cart =
                cartItem.getCart();

        cartItemRepository.delete(
                cartItem
        );

        return buildCartResponse(
                cart
        );
    }


    /* ============================================================
       CLEAR CART
    ============================================================ */

    @Transactional
    public void clearCart(
            String email
    ) {

        User user =
                userRepository.findByEmail(email);

        if (user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        Cart cart =
                cartRepository
                        .findByUser(user)
                        .orElse(null);

        if (cart == null) {
            return;
        }

        cartItemRepository.deleteByCart(
                cart
        );
    }


    /* ============================================================
       BUILD CART RESPONSE
    ============================================================ */

    private CartResponse buildCartResponse(
            Cart cart
    ) {

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        List<CartItemResponse> responseItems =
                new ArrayList<>();


        /* --------------------------------------------------------
           CART TOTALS
        -------------------------------------------------------- */

        BigDecimal subtotal =
                BigDecimal.ZERO;

        BigDecimal discount =
                BigDecimal.ZERO;

        int itemCount = 0;


        /* ========================================================
           LOOP CART ITEMS
        ======================================================== */

        for (CartItem item : cartItems) {

            Inventory inventory =
                    item.getInventory();

            if (inventory == null) {
                continue;
            }


            /* ----------------------------------------------------
               PRODUCT
            ---------------------------------------------------- */

            Product product =
                    inventory.getProduct();

            if (product == null) {
                continue;
            }


            /* ----------------------------------------------------
               COLOR
               
               Color is used for display information only.
               Color price is NOT used for cart pricing.
            ---------------------------------------------------- */

            Color color =
                    inventory.getColor();

            if (color == null) {
                continue;
            }


            /* ====================================================
               ADMIN BASE PRICE
               
               Product.basePrice is the original price.
            ==================================================== */

            BigDecimal basePrice =
                    product.getBasePrice() == null
                            ? BigDecimal.ZERO
                            : product.getBasePrice();


            if (basePrice.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                basePrice =
                        BigDecimal.ZERO;
            }


            /* ====================================================
               VENDOR DISCOUNT
            ==================================================== */

            BigDecimal discountPercent =
                    inventory.getDiscount() == null
                            ? BigDecimal.ZERO
                            : inventory.getDiscount();


            /* ----------------------------------------------------
               VALIDATE DISCOUNT
            ---------------------------------------------------- */

            if (discountPercent.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                discountPercent =
                        BigDecimal.ZERO;
            }


            if (discountPercent.compareTo(
                    new BigDecimal("100")
            ) > 0) {

                discountPercent =
                        new BigDecimal("100");
            }


            /* ====================================================
               DISCOUNT AMOUNT PER UNIT
            ==================================================== */

            BigDecimal discountAmount =
                    basePrice
                            .multiply(discountPercent)
                            .divide(
                                    BigDecimal.valueOf(100),
                                    2,
                                    RoundingMode.HALF_UP
                            );


            /* ====================================================
               FINAL PRICE PER UNIT
               
               finalPrice =
               basePrice - discountAmount
            ==================================================== */

            BigDecimal finalPrice =
                    basePrice.subtract(
                            discountAmount
                    );


            /* ====================================================
               QUANTITY
            ==================================================== */

            int itemQuantity =
                    item.getQuantity() == null
                            ? 0
                            : item.getQuantity();


            BigDecimal quantity =
                    BigDecimal.valueOf(
                            itemQuantity
                    );


            /* ====================================================
               ITEM SUBTOTAL
            ==================================================== */

            BigDecimal itemSubtotal =
                    basePrice.multiply(
                            quantity
                    );


            /* ====================================================
               ITEM DISCOUNT
            ==================================================== */

            BigDecimal itemDiscount =
                    discountAmount.multiply(
                            quantity
                    );


            /* ====================================================
               ITEM TOTAL
            ==================================================== */

            BigDecimal itemTotal =
                    finalPrice.multiply(
                            quantity
                    );


            /* ====================================================
               UPDATE CART TOTALS
            ==================================================== */

            subtotal =
                    subtotal.add(
                            itemSubtotal
                    );

            discount =
                    discount.add(
                            itemDiscount
                    );

            itemCount +=
                    itemQuantity;


            /* ====================================================
               CREATE RESPONSE ITEM
            ==================================================== */

            CartItemResponse itemResponse =
                    new CartItemResponse();


            itemResponse.setCartItemId(
                    item.getId()
            );

            itemResponse.setInventoryId(
                    inventory.getId()
            );


            /* ====================================================
               PRODUCT INFORMATION
            ==================================================== */

            itemResponse.setProductId(
                    product.getId()
            );

            itemResponse.setProductName(
                    product.getName()
            );

            itemResponse.setBrand(
                    product.getBrand() !=null
                    ? product.getBrand().getName()
                    :null
            );

            itemResponse.setCategory(
                    product.getCategory() != null
                    ? product.getCategory().getName()
                    :null
            );

            itemResponse.setImage(
                    product.getThumbnailUrl()
            );


            /* ====================================================
               VENDOR
            ==================================================== */

            if (inventory.getVendor() != null) {

                itemResponse.setVendorName(
                        inventory
                                .getVendor()
                                .getShopName()
                );
            }


            /* ====================================================
               PRICE INFORMATION
            ==================================================== */

            itemResponse.setPrice(
                    finalPrice
            );

            itemResponse.setDiscount(
                    discountPercent
            );


            /* ====================================================
               QUANTITY / STOCK
            ==================================================== */

            itemResponse.setQuantity(
                    itemQuantity
            );

            itemResponse.setStock(
                    inventory.getStock()
            );


            /* ====================================================
               VARIANT
            ==================================================== */

            if (inventory.getVariant() != null) {

                itemResponse.setVariant(
                        inventory
                                .getVariant()
                                .getName()
                );
            }


            /* ====================================================
               COLOR
            ==================================================== */

            itemResponse.setColor(
                    color.getName()
            );


            /* ====================================================
               ITEM TOTAL
            ==================================================== */

            itemResponse.setItemTotal(
                    itemTotal
            );

            responseItems.add(
                    itemResponse
            );
        }


        /* ========================================================
           DELIVERY
        ======================================================== */

        BigDecimal delivery =
                BigDecimal.ZERO;


        /* ========================================================
           FINAL TOTAL
        ======================================================== */

        BigDecimal total =
                subtotal
                        .subtract(discount)
                        .add(delivery);


        /* ========================================================
           CART RESPONSE
        ======================================================== */

        CartResponse response =
                new CartResponse();

        response.setCartId(
                cart.getId()
        );

        response.setItemCount(
                itemCount
        );

        response.setSubtotal(
                subtotal
        );

        response.setDiscount(
                discount
        );

        response.setDelivery(
                delivery
        );

        response.setTotal(
                total
        );

        response.setItems(
                responseItems
        );

        return response;
    }
}