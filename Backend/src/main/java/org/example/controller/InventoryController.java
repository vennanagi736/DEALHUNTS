package org.example.controller;

import java.util.List;

import org.example.dto.InventoryTable;
import org.example.entity.Inventory;
import org.example.service.InventoryService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(
            InventoryService inventoryService
    ) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/add")
    public Inventory addInventory(
            @RequestBody InventoryTable inventoryTable
    ) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
            authentication.getName() == null ||
            authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException("Vendor is not authenticated");
        }

        String email = authentication.getName();

        return inventoryService.saveInventory(
                inventoryTable,
                email
        );
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Inventory> vendorInventory(
            @PathVariable Long vendorId
    ) {

        return inventoryService.getVendorInventory(vendorId);
    }

    @GetMapping("/all")
    public List<Inventory> allInventory() {

        return inventoryService.getAllInventory();
    }

    @DeleteMapping("/{id}")
    public void deleteInventory(
            @PathVariable Long id
    ) {

        inventoryService.deleteInventory(id);
    }
}