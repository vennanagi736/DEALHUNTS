package org.example.controller;

import java.util.List;
import java.util.Map;

import org.example.dto.LoginRequest;
import org.example.dto.LoginResponse;
import org.example.dto.VendorDetailsDTO;
import org.example.dto.VendorProductDTO;
import org.example.entity.Product;
import org.example.entity.Vendor;
import org.example.repository.InventoryRepository;
import org.example.repository.ProductRepository;
import org.example.repository.VendorRepository;
import org.example.security.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor")
public class VendorController {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
private InventoryRepository inventoryRepository;

    @Autowired
    private JWTUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ---------------- REGISTER ----------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Vendor vendor) {

        vendor.setStatus("PENDING");
        vendor.setPassword(passwordEncoder.encode(vendor.getPassword()));
        vendor.setRole("ROLE_VENDOR");

        vendorRepository.save(vendor);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Registration request submitted successfully"
                )
        );
    }


    // ---------------- LOGIN ----------------
   @PostMapping("/login")
public LoginResponse login(@RequestBody LoginRequest request) {

    System.out.println("STEP 1");

    Vendor vendor = vendorRepository.findByEmail(request.getEmail().trim());

    System.out.println("STEP 2");
    System.out.println("Vendor found:" +(vendor != null));

    if (vendor == null) {
        System.out.println("VENDOR NOT FOUND");
        return new LoginResponse(
                false,
                "Vendor not found",
                null,
                null,
                null,
                null
        );
    }

    // ================= ADD THIS =================
    System.out.println("STATUS = " + vendor.getStatus());

if ("PENDING".equalsIgnoreCase(vendor.getStatus())) {
    return new LoginResponse(
            false,
            "PENDING",
            null,
            vendor.getEmail(),
            null,
            null
    );
}

if ("REJECTED".equalsIgnoreCase(vendor.getStatus())) {
    return new LoginResponse(
            false,
            "Vendor Request Rejected",
            null,
            vendor.getEmail(),
            null,
            null
    );
}

    // ============================================

    System.out.println("STEP 3");

    if (!passwordEncoder.matches(request.getPassword(), vendor.getPassword())) {
        System.out.println("WRONG PASSWORD");
        return new LoginResponse(
                false,
                "Invalid password",
                null,
                null,
                null,
                null
        );
    }

    System.out.println("STEP 4");

    String token = jwtUtil.generateToken(
            vendor.getEmail(),
            vendor.getRole()
    );

    System.out.println("STEP 5");

    return new LoginResponse(
            true,
            "Login successful",
            token,
            vendor.getEmail(),
            vendor.getRole(),
            vendor.getId()
    );
}

@GetMapping("/status")
public String getStatus(@RequestParam String email) {
    System.out.println("Status api hit");

    Vendor vendor = vendorRepository.findByEmail(email);

    if (vendor == null) {
        return "NOT_FOUND";
    }

    return vendor.getStatus();
    }
    @GetMapping("/count")
    public ResponseEntity<Long> getVendorCount() {
    return ResponseEntity.ok(vendorRepository.count());
    }
    @GetMapping("/products/active")
    public List<Product> getActiveProducts() {
    return productRepository.findByActiveTrue();
    }

   @GetMapping("/myProducts")
public List<VendorProductDTO> getMyProducts(
        @RequestParam int vendorId) {

    List<VendorProductDTO> products =
            inventoryRepository.findActiveProductsByVendorId(vendorId);

    System.out.println("========== MY PRODUCTS ==========");
    System.out.println("Vendor ID: " + vendorId);

    products.forEach(p ->
        System.out.println(
            "Product: " + p.getName() +
            " | ID: " + p.getId() +
            " | Base Price: " + p.getBasePrice() +
            " | Discount: " + p.getDiscount() +
            " | Final Price: " + p.getFinalPrice() +
            " | Stock: " + p.getStock()
        )
    );

    System.out.println("================================");

    return products;
}

@GetMapping("/{id}")
public ResponseEntity<?> getVendorById(
        @PathVariable Integer id) {

    Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Vendor not found with id: " + id
                    )
            );

    VendorDetailsDTO dto = new VendorDetailsDTO(
            vendor.getId(),
            vendor.getFullName(),
            vendor.getShopName(),
            vendor.getPhoneNo(),
            vendor.getState(),
            vendor.getCity(),
            vendor.getPincode(),
            vendor.getLatitude(),
            vendor.getLongitude(),
            vendor.getAddress(),
            vendor.getEmail(),
            vendor.getRole(),
            vendor.getStatus(),
            vendor.getLocationLink()
    );

    return ResponseEntity.ok(dto);
}
}