package org.example.repository;

import org.example.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin,Integer> {
   Admin findByEmail(String email);   
}
