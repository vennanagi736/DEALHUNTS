package org.example.service;

import java.util.List;

import org.example.entity.Vendor;
import org.example.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }
     public Vendor updateStatus(Integer id, String status) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        vendor.setStatus(status);
        return vendorRepository.save(vendor);
}
}