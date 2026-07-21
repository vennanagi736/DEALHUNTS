package org.example.repository;

import java.util.List;

import org.example.entity.ProductMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductMasterRepository extends JpaRepository<ProductMaster, Integer> {

    List<ProductMaster> findByBrandId(Integer brandId);

}