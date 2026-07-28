package org.example.service;

import java.util.List;

import org.example.dto.InventoryTable;
import org.example.entity.Inventory;
import org.example.repository.ColorRepository;
import org.example.repository.InventoryRepository;
import org.example.repository.ProductRepository;
import org.example.repository.VariantRepository;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final VariantRepository variantRepository;
    private final ColorRepository colorRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository,
            VariantRepository variantRepository,
            ColorRepository colorRepository
              ) {

        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.colorRepository = colorRepository;
    }


    public Inventory saveInventory(
        InventoryTable dto
) {


        Inventory inventory = new Inventory();


        inventory.setProduct(
            productRepository.findById(dto.getProductId())
            .orElse(null)
        );


        inventory.setVariant(
            variantRepository.findById(dto.getVariantId().intValue())
            .orElse(null)
        );


        inventory.setColor(
            colorRepository.findById(dto.getColorId().intValue())
            .orElse(null)
        );

        inventory.setSellingPrice(dto.getSellingPrice());
        inventory.setStock(dto.getStock());
        inventory.setDiscount(dto.getDiscount());
        inventory.setCondition(dto.getCondition());
        inventory.setWarranty(dto.getWarranty());        inventory.setDeliveryTime(dto.getDeliveryTime());
        inventory.setHomeDelivery(dto.getHomeDelivery());
        inventory.setStorePickup(dto.getStorePickup());
        inventory.setCod(dto.getCod());
        inventory.setEmi(dto.getEmi());
        inventory.setExchange(dto.getExchange());
        inventory.setOfferTitle(dto.getOfferTitle());
        inventory.setOfferDescription(dto.getOfferDescription());
        inventory.setReturnPolicy(dto.getReturnPolicy());
Inventory savedInventory = inventoryRepository.save(inventory);

return savedInventory;


    }
    public List<Inventory> getVendorInventory(Long vendorId) {

    return inventoryRepository.findByVendor_Id(vendorId.intValue());

}


public List<Inventory> getAllInventory() {

    return inventoryRepository.findAll();

}


public void deleteInventory(Long id) {

    inventoryRepository.deleteById(id);

}

}