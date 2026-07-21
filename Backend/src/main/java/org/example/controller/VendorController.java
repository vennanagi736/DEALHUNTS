package org.example.controller;

import java.util.Map;

import org.example.dto.LoginRequest;
import org.example.dto.LoginResponse;
import org.example.entity.Vendor;
import org.example.repository.VendorRepository;
import org.example.security.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
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
}