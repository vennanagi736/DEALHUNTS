package org.example.service;

import java.util.List;
import java.util.stream.Collectors;

import org.example.dto.WishlistDTO;
import org.example.entity.Product;
import org.example.entity.User;
import org.example.entity.Wishlist;
import org.example.repository.ProductRepository;
import org.example.repository.UserRepository;
import org.example.repository.WishlistRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;


    public WishlistService(
        WishlistRepository wishlistRepository,
        UserRepository userRepository,
        ProductRepository productRepository
    ) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
            SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (
            authentication == null ||
            !authentication.isAuthenticated()
        ) {
            throw new RuntimeException(
                "User is not authenticated"
            );
        }

        String email =
            authentication.getName();

        if (
            email == null ||
            email.trim().isEmpty()
        ) {
            throw new RuntimeException(
                "User email not found"
            );
        }

        User user =
            userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException(
                "User not found"
            );
        }

        return user;
    }


    // =========================================================
    // ADD TO WISHLIST
    // =========================================================

    @Transactional
    public WishlistDTO addToWishlist(
        Long productId
    ) {

        User user =
            getCurrentUser();


        Product product =
            productRepository
                .findById(productId)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Product not found"
                    )
                );


        /*
         * Prevent duplicate wishlist entries.
         */

        boolean alreadyExists =
            wishlistRepository
                .existsByUserAndProduct(
                    user,
                    product
                );


        if (alreadyExists) {

            Wishlist existing =
                wishlistRepository
                    .findByUserAndProduct(
                        user,
                        product
                    )
                    .orElseThrow(
                        () -> new RuntimeException(
                            "Wishlist item not found"
                        )
                    );

            return convertToDTO(existing);
        }


        Wishlist wishlist =
            new Wishlist(
                user,
                product
            );


        Wishlist saved =
            wishlistRepository.save(
                wishlist
            );


        return convertToDTO(saved);
    }


    // =========================================================
    // REMOVE FROM WISHLIST
    // =========================================================

    @Transactional
    public void removeFromWishlist(
        Long productId
    ) {

        User user =
            getCurrentUser();


        Product product =
            productRepository
                .findById(productId)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Product not found"
                    )
                );


        boolean exists =
            wishlistRepository
                .existsByUserAndProduct(
                    user,
                    product
                );


        if (!exists) {
            throw new RuntimeException(
                "Product is not in wishlist"
            );
        }


        /*
         * This is a DELETE / modifying operation.
         *
         * @Transactional is required so that
         * JPA has an active transaction when
         * deleteByUserAndProduct() executes.
         */

        wishlistRepository
            .deleteByUserAndProduct(
                user,
                product
            );
    }


    // =========================================================
    // GET CURRENT USER WISHLIST
    // =========================================================

    @Transactional(readOnly = true)
    public List<WishlistDTO> getMyWishlist() {

        User user =
            getCurrentUser();


        return wishlistRepository
            .findByUserOrderByCreatedAtDesc(user)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }


    // =========================================================
    // CHECK WISHLIST
    // =========================================================

    @Transactional(readOnly = true)
    public boolean isInWishlist(
        Long productId
    ) {

        User user =
            getCurrentUser();


        Product product =
            productRepository
                .findById(productId)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Product not found"
                    )
                );


        return wishlistRepository
            .existsByUserAndProduct(
                user,
                product
            );
    }


    // =========================================================
    // CONVERT ENTITY → DTO
    // =========================================================

    private WishlistDTO convertToDTO(
        Wishlist wishlist
    ) {

        Product product =
            wishlist.getProduct();


        WishlistDTO dto =
            new WishlistDTO();


        dto.setId(
            wishlist.getId()
        );

        dto.setProductId(
            product.getId()
        );

        dto.setName(
            product.getName()
        );

        dto.setDescription(
            product.getDescription()
        );

        dto.setBasePrice(
            product.getBasePrice()
        );

        dto.setThumbnailUrl(
            product.getThumbnailUrl()
        );

        dto.setCreatedAt(
            wishlist.getCreatedAt()
        );


        /*
         * Product now contains nested Brand
         * and Category objects.
         */

        if (product.getBrand() != null) {

            dto.setBrand(
                product.getBrand().getName()
            );
        }


        if (product.getCategory() != null) {

            dto.setCategory(
                product.getCategory().getName()
            );
        }


        return dto;
    }
}