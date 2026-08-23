
package org.example.service;

import java.util.List;

import org.example.dto.InventoryTable;
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

    public Inventory saveInventory(
            InventoryTable dto,
            String email
    ) {

        // =====================================================
        // 1. CHECK VENDOR
        // =====================================================

        Vendor vendor = vendorRepository.findByEmail(email);

        if (vendor == null) {
            throw new RuntimeException(
                    "Vendor not found for email: " + email
            );
        }


        // =====================================================
        // 2. CHECK PRODUCT ID
        // =====================================================

        if (dto.getProductId() == null) {
            throw new RuntimeException(
                    "Product is required"
            );
        }

        Product product = productRepository
                .findById(dto.getProductId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found: "
                                        + dto.getProductId()
                        )
                );


        // =====================================================
        // 3. CHECK VARIANT ID
        // =====================================================

        if (dto.getVariantId() == null) {
            throw new RuntimeException(
                    "Variant is required"
            );
        }

        Variant variant = variantRepository
                .findById(dto.getVariantId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Variant not found: "
                                        + dto.getVariantId()
                        )
                );


        // =====================================================
        // 4. CHECK COLOR ID
        // =====================================================

        if (dto.getColorId() == null) {
            throw new RuntimeException(
                    "Color is required"
            );
        }

        Color color = colorRepository
                .findById(dto.getColorId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Color not found: "
                                        + dto.getColorId()
                        )
                );


        // =====================================================
        // 5. CHECK SELLING PRICE
        // =====================================================

        if (dto.getSellingPrice() == null ||
            dto.getSellingPrice() <= 0) {

            throw new RuntimeException(
                    "Selling price must be greater than 0"
            );
        }


        // =====================================================
        // 6. CHECK STOCK
        // =====================================================

        if (dto.getStock() == null ||
            dto.getStock() < 0) {

            throw new RuntimeException(
                    "Stock is required and cannot be negative"
            );
        }


        // =====================================================
        // 7. CREATE INVENTORY
        // =====================================================

        Inventory inventory = new Inventory();

        inventory.setVendor(vendor);
        inventory.setProduct(product);
        inventory.setVariant(variant);
        inventory.setColor(color);


        // =====================================================
        // 8. SET INVENTORY DATA
        // =====================================================

        inventory.setSellingPrice(
                dto.getSellingPrice()
        );

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


        // =====================================================
        // 9. SAVE ONLY AFTER EVERYTHING IS VALID
        // =====================================================

        return inventoryRepository.save(inventory);
    }


    public List<Inventory> getVendorInventory(
            Long vendorId
    ) {

        return inventoryRepository.findByVendor_Id(
                vendorId.intValue()
        );
    }


    public List<Inventory> getAllInventory() {

        return inventoryRepository.findAll();
    }


    public void deleteInventory(Long id) {

        inventoryRepository.deleteById(id);
    }
}