package org.example.repository;

import org.example.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor,Integer> {
   Vendor findByEmail(String email);   
}
