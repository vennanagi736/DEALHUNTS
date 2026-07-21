package org.example.controller;

import java.util.List;

import org.example.dto.LoginRequest;
import org.example.dto.LoginResponse;
import org.example.entity.Admin;
import org.example.entity.Vendor;
import org.example.repository.AdminRepository;
import org.example.repository.VendorRepository;
import org.example.security.JWTUtil;
import org.example.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private JWTUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    // ---------------- VENDOR REQUESTS ----------------
    @GetMapping("/vendor-requests")
    public List<Vendor> getAllVendorRequests() {
        System.out.println("Admincontroller :/vendor-requests reached");
        return vendorService.getAllVendors();
    }

    // ---------------- APPROVE ----------------
    @PutMapping("/vendor/{id}/approve")
    public Vendor approveVendor(@PathVariable Integer id) {
        return vendorService.updateStatus(id, "APPROVED");
    }

    // ---------------- REJECT ----------------
    @PutMapping("/vendor/{id}/reject")
    public Vendor rejectVendor(@PathVariable Integer id) {
        return vendorService.updateStatus(id, "REJECTED");
    }

    // ---------------- ADMIN LOGIN ----------------
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        try {
            Admin admin = adminRepository.findByEmail(request.getEmail().trim());

            if (admin == null) {
                return new LoginResponse(false, "Admin not found",
                        null, null, null, null);
            }

            if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                return new LoginResponse(false, "Invalid password",
                        null, null, null, null);
            }

            String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole());
            System.out.println("JWT TOKEN = " + token);

            return new LoginResponse(true, "Login successful",
                    token, admin.getEmail(), admin.getRole(), admin.getId());

        } catch (Exception e) {
            e.printStackTrace();
            return new LoginResponse(false, "JWT ERROR: " + e.getMessage(),
                    null, null, null, null);
        }
    }
    @GetMapping("/manage-vendors")
    public List<Vendor> getAllVendors(){
        return vendorRepository.findAll();
    }
}