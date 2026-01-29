package com.example.repository;

import com.example.entity.Address;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Integer> {

	List<Address> findByUser_Email(String name);
}
