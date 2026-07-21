package org.example.repository;

import java.util.List;

import org.example.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    List<Inventory> findByVendor_Id(int id);

    List<Inventory> findByProduct_Id(Long productId);

}