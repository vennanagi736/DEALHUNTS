package org.example.service;

import java.math.BigDecimal;
import java.util.List;

import org.example.dto.InventoryTable;
import org.example.dto.InventoryVendorDTO;
import org.example.dto.VendorProductDTO;
import org.example.entity.Color;
import org.example.entity.Inventory;
import org.example.entity.Product;
import org.example.entity.Variant;
import org.example.entity.Vendor;
import org.example.repository.ColorRepository;
import org.example.repository.InventoryRepository;
import org.example.repository.ProductRepository;
import org.example.repository.VariantRepository;
import org.example.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final VariantRepository variantRepository;
    private final ColorRepository colorRepository;
    private final VendorRepository vendorRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository,
            VariantRepository variantRepository,
            ColorRepository colorRepository,
            VendorRepository vendorRepository
    ) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.colorRepository = colorRepository;
        this.vendorRepository = vendorRepository;
    }

    // ============================================================
    // ADD INVENTORY
    // ============================================================

    @Transactional
    public Inventory saveInventory(
            InventoryTable dto,
            String email
    ) {

        Vendor vendor =
                vendorRepository.findByEmail(email);

        if (vendor == null) {
            throw new RuntimeException(
                    "Vendor not found for email: " + email
            );
        }

        // ========================================================
        // PRODUCT
        // ========================================================

        if (dto.getProductId() == null) {
            throw new RuntimeException(
                    "Product is required"
            );
        }

        Product product =
                productRepository
                        .findById(dto.getProductId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found: "
                                                + dto.getProductId()
                                )
                        );

        if (!product.isActive()) {
            throw new RuntimeException(
                    "Product is not active"
            );
        }

        if (product.getBasePrice() == null ||
                product.getBasePrice()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Base price is not configured for this product"
            );
        }

        // ========================================================
        // VARIANT
        // ========================================================

        if (dto.getVariantId() == null) {
            throw new RuntimeException(
                    "Variant is required"
            );
        }

        Variant variant =
                variantRepository
                        .findById(dto.getVariantId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Variant not found: "
                                                + dto.getVariantId()
                                )
                        );

        // ========================================================
        // COLOR
        // ========================================================

        if (dto.getColorId() == null) {
            throw new RuntimeException(
                    "Color is required"
            );
        }

        Color color =
                colorRepository
                        .findById(dto.getColorId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Color not found: "
                                                + dto.getColorId()
                                )
                        );

        // ========================================================
        // VERIFY VARIANT BELONGS TO PRODUCT
        // ========================================================

        if (variant.getProduct() == null ||
                !variant.getProduct()
                        .getId()
                        .equals(product.getId())) {

            throw new RuntimeException(
                    "Variant does not belong to selected product"
            );
        }

        // ========================================================
        // VERIFY COLOR BELONGS TO PRODUCT
        // ========================================================

        if (color.getProduct() == null ||
                !color.getProduct()
                        .getId()
                        .equals(product.getId())) {

            throw new RuntimeException(
                    "Color does not belong to selected product"
            );
        }

        // ========================================================
        // VERIFY COLOR BELONGS TO VARIANT
        // ========================================================

        if (color.getVariant() == null ||
                !color.getVariant()
                        .getId()
                        .equals(variant.getId())) {

            throw new RuntimeException(
                    "Color does not belong to selected variant"
            );
        }

        // ========================================================
        // STOCK
        // ========================================================

        if (dto.getStock() == null ||
                dto.getStock() < 0) {

            throw new RuntimeException(
                    "Stock is required and cannot be negative"
            );
        }

        // ========================================================
        // DISCOUNT
        // ========================================================

        if (dto.getDiscount() == null ||
                dto.getDiscount()
                        .compareTo(BigDecimal.ZERO) < 0 ||
                dto.getDiscount()
                        .compareTo(BigDecimal.valueOf(100)) > 0) {

            throw new RuntimeException(
                    "Discount must be between 0 and 100"
            );
        }

        // ========================================================
        // CREATE INVENTORY
        // ========================================================

        Inventory inventory =
                new Inventory();

        inventory.setVendor(vendor);
        inventory.setProduct(product);
        inventory.setVariant(variant);
        inventory.setColor(color);

        inventory.setStock(
                dto.getStock()
        );

        inventory.setDiscount(
                dto.getDiscount()
        );

        inventory.setCondition(
                dto.getCondition()
        );

        inventory.setWarranty(
                dto.getWarranty()
        );

        inventory.setDeliveryTime(
                dto.getDeliveryTime()
        );

        inventory.setHomeDelivery(
                dto.getHomeDelivery()
        );

        inventory.setStorePickup(
                dto.getStorePickup()
        );

        inventory.setCod(
                dto.getCod()
        );

        inventory.setEmi(
                dto.getEmi()
        );

        inventory.setExchange(
                dto.getExchange()
        );

        inventory.setOfferTitle(
                dto.getOfferTitle()
        );

        inventory.setOfferDescription(
                dto.getOfferDescription()
        );

        inventory.setReturnPolicy(
                dto.getReturnPolicy()
        );

        inventory.setMinPurchase(
                dto.getMinPurchase()
        );

        inventory.setMaxPurchase(
                dto.getMaxPurchase()
        );

        return inventoryRepository.save(
                inventory
        );
    }

    // ============================================================
    // GET VENDOR INVENTORY
    // ============================================================

    public List<Inventory> getVendorInventory(
            Long vendorId
    ) {

        return inventoryRepository.findByVendor_Id(
                vendorId
        );
    }

    // ============================================================
    // GET ACTIVE PRODUCTS FOR VENDOR
    // ============================================================

    public List<VendorProductDTO> getActiveProductsByVendorId(
            Long vendorId
    ) {

        return inventoryRepository
                .findActiveProductsByVendorId(
                        vendorId
                );
    }

    // ============================================================
    // GET ALL INVENTORY
    // ============================================================

    public List<Inventory> getAllInventory() {

        return inventoryRepository.findAll();
    }

    // ============================================================
    // DELETE INVENTORY
    // ============================================================

    public void deleteInventory(Long id) {

        if (!inventoryRepository.existsById(id)) {

            throw new RuntimeException(
                    "Inventory not found"
            );
        }

        inventoryRepository.deleteById(id);
    }

    // ============================================================
    // GET AVAILABLE VENDORS
    // ============================================================

    public List<InventoryVendorDTO>
    getAvailableVendorsByProductId(
            Long productId
    ) {

        return inventoryRepository
                .findAvailableVendorsByProductId(
                        productId
                );
    }

    // ============================================================
// UPDATE INVENTORY
// ============================================================

@Transactional
public Inventory updateInventory(
        Long inventoryId,
        InventoryTable dto,
        String email
) {

    // ========================================================
    // VENDOR
    // ========================================================

    Vendor vendor =
            vendorRepository.findByEmail(email);

    if (vendor == null) {
        throw new RuntimeException(
                "Vendor not found for email: " + email
        );
    }

    // ========================================================
    // FIND EXISTING INVENTORY
    // ========================================================

    Inventory inventory =
            inventoryRepository.findById(inventoryId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Inventory not found: "
                                            + inventoryId
                            )
                    );

    // ========================================================
    // VERIFY INVENTORY BELONGS TO LOGGED-IN VENDOR
    // ========================================================

    if (inventory.getVendor() == null ||
            inventory.getVendor()
                    .getId()!= 
                    vendor.getId()) {

        throw new RuntimeException(
                "You are not authorized to update this inventory"
        );
    }

    // ========================================================
    // PRODUCT
    // ========================================================

    if (dto.getProductId() == null) {
        throw new RuntimeException(
                "Product is required"
        );
    }

    Product product =
            productRepository
                    .findById(dto.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: "
                                            + dto.getProductId()
                            )
                    );

    if (!product.isActive()) {
        throw new RuntimeException(
                "Product is not active"
        );
    }

    if (product.getBasePrice() == null ||
            product.getBasePrice()
                    .compareTo(BigDecimal.ZERO) <= 0) {

        throw new RuntimeException(
                "Base price is not configured for this product"
        );
    }

    // ========================================================
    // VARIANT
    // ========================================================

    if (dto.getVariantId() == null) {
        throw new RuntimeException(
                "Variant is required"
        );
    }

    Variant variant =
            variantRepository
                    .findById(dto.getVariantId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Variant not found: "
                                            + dto.getVariantId()
                            )
                    );

    // ========================================================
    // COLOR
    // ========================================================

    if (dto.getColorId() == null) {
        throw new RuntimeException(
                "Color is required"
        );
    }

    Color color =
            colorRepository
                    .findById(dto.getColorId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Color not found: "
                                            + dto.getColorId()
                            )
                    );

    // ========================================================
    // VERIFY VARIANT BELONGS TO PRODUCT
    // ========================================================

    if (variant.getProduct() == null ||
            !variant.getProduct()
                    .getId()
                    .equals(product.getId())) {

        throw new RuntimeException(
                "Variant does not belong to selected product"
        );
    }

    // ========================================================
    // VERIFY COLOR BELONGS TO PRODUCT
    // ========================================================

    if (color.getProduct() == null ||
            !color.getProduct()
                    .getId()
                    .equals(product.getId())) {

        throw new RuntimeException(
                "Color does not belong to selected product"
        );
    }

    // ========================================================
    // VERIFY COLOR BELONGS TO VARIANT
    // ========================================================

    if (color.getVariant() == null ||
            !color.getVariant()
                    .getId()
                    .equals(variant.getId())) {

        throw new RuntimeException(
                "Color does not belong to selected variant"
        );
    }

    // ========================================================
    // STOCK
    // ========================================================

    if (dto.getStock() == null ||
            dto.getStock() < 0) {

        throw new RuntimeException(
                "Stock is required and cannot be negative"
        );
    }

    // ========================================================
    // DISCOUNT
    // ========================================================

    if (dto.getDiscount() == null ||
            dto.getDiscount()
                    .compareTo(BigDecimal.ZERO) < 0 ||
            dto.getDiscount()
                    .compareTo(BigDecimal.valueOf(100)) > 0) {

        throw new RuntimeException(
                "Discount must be between 0 and 100"
        );
    }

    // ========================================================
    // UPDATE EXISTING INVENTORY
    // ========================================================

    inventory.setVendor(vendor);
    inventory.setProduct(product);
    inventory.setVariant(variant);
    inventory.setColor(color);

    inventory.setStock(
            dto.getStock()
    );

    inventory.setDiscount(
            dto.getDiscount()
    );

    inventory.setCondition(
            dto.getCondition()
    );

    inventory.setWarranty(
            dto.getWarranty()
    );

    inventory.setDeliveryTime(
            dto.getDeliveryTime()
    );

    inventory.setHomeDelivery(
            dto.getHomeDelivery()
    );

    inventory.setStorePickup(
            dto.getStorePickup()
    );

    inventory.setCod(
            dto.getCod()
    );

    inventory.setEmi(
            dto.getEmi()
    );

    inventory.setExchange(
            dto.getExchange()
    );

    inventory.setOfferTitle(
            dto.getOfferTitle()
    );

    inventory.setOfferDescription(
            dto.getOfferDescription()
    );

    inventory.setReturnPolicy(
            dto.getReturnPolicy()
    );

    inventory.setMinPurchase(
            dto.getMinPurchase()
    );

    inventory.setMaxPurchase(
            dto.getMaxPurchase()
    );

    return inventoryRepository.save(
            inventory
    );
}
}