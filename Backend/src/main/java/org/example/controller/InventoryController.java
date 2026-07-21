package org.example.controller;

import java.util.List;

import org.example.dto.InventoryTable;
import org.example.entity.Inventory;
import org.example.service.InventoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Add Inventory
    @PostMapping("/add")
public Inventory addInventory(
        @RequestBody InventoryTable inventoryTable) {

    return inventoryService.saveInventory(inventoryTable);
}

    // Vendor Inventory
    @GetMapping("/vendor/{vendorId}")
    public List<Inventory> vendorInventory(
            @PathVariable Long vendorId) {

        return inventoryService.getVendorInventory(vendorId);
    }

    // All Inventory
    @GetMapping("/all")
    public List<Inventory> allInventory() {

        return inventoryService.getAllInventory();
    }

    // Delete Inventory
    @DeleteMapping("/{id}")
    public void deleteInventory(
            @PathVariable Long id) {

        inventoryService.deleteInventory(id);
    }

}