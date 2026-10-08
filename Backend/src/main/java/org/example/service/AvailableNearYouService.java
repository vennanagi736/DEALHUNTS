package org.example.service;

import org.example.dto.AvailableNearYouAdminDTO;
import org.example.dto.AvailableNearYouResponseDTO;
import org.example.entity.AvailableNearYou;
import org.example.entity.Inventory;
import org.example.entity.Product;
import org.example.entity.Vendor;
import org.example.repository.AvailableNearYouRepository;
import org.example.repository.InventoryRepository;
import org.example.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class AvailableNearYouService {

    private static final int MAX_PRODUCTS = 7;
    private static final int MAX_RESULTS = 5;

    private static final double EARTH_RADIUS_KM = 6371.0;

    private final AvailableNearYouRepository availableNearYouRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public AvailableNearYouService(
            AvailableNearYouRepository availableNearYouRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository
    ) {
        this.availableNearYouRepository = availableNearYouRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // ============================================================
    // ADMIN - GET SELECTED PRODUCTS
    // ============================================================

    @Transactional(readOnly = true)
    public List<AvailableNearYouAdminDTO> getAllSelectedProducts() {

        List<AvailableNearYou> records =
                availableNearYouRepository.findAllByOrderByIdAsc();

        List<AvailableNearYouAdminDTO> result =
                new ArrayList<>();

        for (AvailableNearYou item : records) {

            Product product = item.getProduct();

            result.add(
                    new AvailableNearYouAdminDTO(
                            item.getId(),
                            product.getId(),
                            product.getName()
                    )
            );
        }

        return result;
    }

    // ============================================================
    // ADMIN - ADD PRODUCT
    // ============================================================

    public AvailableNearYouAdminDTO addProduct(Long productId) {

        if (productId == null) {
            throw new RuntimeException(
                    "Product ID is required."
            );
        }

        if (availableNearYouRepository.count() >= MAX_PRODUCTS) {
            throw new RuntimeException(
                    "Maximum 7 products can be selected."
            );
        }

        if (availableNearYouRepository.existsByProductId(productId)) {
            throw new RuntimeException(
                    "This product is already selected."
            );
        }

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found."
                                )
                        );

        AvailableNearYou item =
                new AvailableNearYou(product);

        AvailableNearYou saved =
                availableNearYouRepository.save(item);

        return new AvailableNearYouAdminDTO(
                saved.getId(),
                product.getId(),
                product.getName()
        );
    }

    // ============================================================
    // ADMIN - DELETE PRODUCT
    // ============================================================

    public void removeProduct(Long id) {

        if (!availableNearYouRepository.existsById(id)) {
            throw new RuntimeException(
                    "Available Near You product not found."
            );
        }

        availableNearYouRepository.deleteById(id);
    }

    // ============================================================
    // USER - FIND NEARBY PRODUCTS
    // ============================================================

    @Transactional(readOnly = true)
    public List<AvailableNearYouResponseDTO> findNearbyProducts(
            Double latitude,
            Double longitude,
            String search
    ) {

        if (latitude == null || longitude == null) {
            throw new RuntimeException(
                    "User location is required."
            );
        }

        if (latitude < -90 || latitude > 90) {
            throw new RuntimeException(
                    "Invalid latitude."
            );
        }

        if (longitude < -180 || longitude > 180) {
            throw new RuntimeException(
                    "Invalid longitude."
            );
        }

        List<AvailableNearYou> selectedProducts =
                availableNearYouRepository
                        .findAllByOrderByIdAsc();

        List<AvailableNearYouResponseDTO> results =
                new ArrayList<>();

        String searchText =
                search == null
                        ? ""
                        : search.trim().toLowerCase();

        for (AvailableNearYou selected : selectedProducts) {

            Product product = selected.getProduct();

            // ====================================================
            // SEARCH PRODUCT
            // ====================================================

            if (!searchText.isEmpty()) {

                String productName =
                        product.getName() == null
                                ? ""
                                : product.getName().toLowerCase();

                if (!productName.contains(searchText)) {
                    continue;
                }
            }

            // ====================================================
            // FIND INVENTORY
            // ====================================================

            List<Inventory> inventories =
                    inventoryRepository.findByProduct_Id(
                            product.getId()
                    );

            for (Inventory inventory : inventories) {

                // Only products currently in stock
                if (inventory.getStock() == null ||
                        inventory.getStock() <= 0) {
                    continue;
                }

                Vendor vendor = inventory.getVendor();

                if (vendor == null) {
                    continue;
                }

                // Vendor must have location
                if (vendor.getLatitude() == null ||
                        vendor.getLongitude() == null) {
                    continue;
                }

                // =================================================
                // CALCULATE DISTANCE
                // =================================================

                double distanceKm =
                        calculateDistance(
                                latitude,
                                longitude,
                                vendor.getLatitude(),
                                vendor.getLongitude()
                        );

                String distanceRange =
                        getDistanceRange(distanceKm);

                results.add(
                        new AvailableNearYouResponseDTO(
                                product.getId(),
                                product.getName(),
                                vendor.getId(),
                                vendor.getShopName(),
                                inventory.getStock(),
                                round(distanceKm),
                                distanceRange,
                                "IN STOCK"
                        )
                );
            }
        }

        // ========================================================
        // NEAREST FIRST
        // ========================================================

        results.sort(
                Comparator.comparing(
                        AvailableNearYouResponseDTO
                                ::getDistanceKm
                )
        );

        // ========================================================
        // TOP 5 RESULTS
        // ========================================================

        if (results.size() > MAX_RESULTS) {

            return new ArrayList<>(
                    results.subList(
                            0,
                            MAX_RESULTS
                    )
            );
        }

        return results;
    }

    // ============================================================
    // HAVERSINE DISTANCE
    // ============================================================

    private double calculateDistance(
            double userLatitude,
            double userLongitude,
            double vendorLatitude,
            double vendorLongitude
    ) {

        double latDifference =
                Math.toRadians(
                        vendorLatitude - userLatitude
                );

        double lonDifference =
                Math.toRadians(
                        vendorLongitude - userLongitude
                );

        double a =
                Math.sin(latDifference / 2)
                        * Math.sin(latDifference / 2)
                        +
                        Math.cos(
                                Math.toRadians(
                                        userLatitude
                                )
                        )
                        *
                        Math.cos(
                                Math.toRadians(
                                        vendorLatitude
                                )
                        )
                        *
                        Math.sin(lonDifference / 2)
                        *
                        Math.sin(lonDifference / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS_KM * c;
    }

    // ============================================================
    // DISTANCE RANGE
    // ============================================================

    private String getDistanceRange(
            double distanceKm
    ) {

        if (distanceKm < 5) {
            return "UNDER 5 KM";
        }

        if (distanceKm < 10) {
            return "5 - 10 KM";
        }

        if (distanceKm < 20) {
            return "10 - 20 KM";
        }

        return "20+ KM";
    }

    // ============================================================
    // ROUND DISTANCE
    // ============================================================

    private double round(double value) {

        return Math.round(value * 10.0) / 10.0;
    }
}
