package org.example.controller;

import java.util.List;

import org.example.dto.InventoryTable;
import org.example.dto.InventoryVendorDTO;
import org.example.entity.Inventory;
import org.example.service.InventoryService;

import org.springframework.http.ResponseEntity;
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

    // ============================================================
    // ADD INVENTORY
    // ============================================================

    @PostMapping("/add")
    public ResponseEntity<Inventory> addInventory(
            @RequestBody InventoryTable inventoryTable
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName()
                        .equals("anonymousUser")) {

            throw new RuntimeException(
                    "Vendor is not authenticated"
            );
        }

        String email =
                authentication.getName();

        Inventory inventory =
                inventoryService.saveInventory(
                        inventoryTable,
                        email
                );

        return ResponseEntity.ok(
                inventory
        );
    }

    // ============================================================
    // GET VENDOR INVENTORY
    // ============================================================

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Inventory>>
    vendorInventory(
            @PathVariable Long vendorId
    ) {

        return ResponseEntity.ok(
                inventoryService.getVendorInventory(
                        vendorId
                )
        );
    }

    // ============================================================
    // GET ALL INVENTORY
    // ============================================================

    @GetMapping("/all")
    public ResponseEntity<List<Inventory>>
    allInventory() {

        return ResponseEntity.ok(
                inventoryService.getAllInventory()
        );
    }

    // ============================================================
    // GET PRODUCT VENDORS
    // ============================================================

    @GetMapping("/product/{productId}/vendors")
    public ResponseEntity<List<InventoryVendorDTO>>
    getProductVendors(
            @PathVariable Long productId
    ) {

        return ResponseEntity.ok(
                inventoryService
                        .getAvailableVendorsByProductId(
                                productId
                        )
        );
    }

    // ============================================================
    // DELETE INVENTORY
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteInventory(
            @PathVariable Long id
    ) {

        inventoryService.deleteInventory(id);

        return ResponseEntity.ok(
                "Inventory deleted successfully"
        );
    }
}