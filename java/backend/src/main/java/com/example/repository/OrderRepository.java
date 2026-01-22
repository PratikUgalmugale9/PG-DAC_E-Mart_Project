package com.example.repository;

import com.example.entity.Ordermaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Ordermaster, Integer> {
}