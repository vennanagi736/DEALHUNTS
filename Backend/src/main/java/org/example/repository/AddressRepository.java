package org.example.repository;

import java.util.Optional;

import org.example.entity.Address;
import org.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {

    Optional<Address> findByUser(User user);

    boolean existsByUser(User user);
}