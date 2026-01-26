package com.example.repository;

import com.example.entity.Ordermaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Ordermaster, Integer> {
    //show my orders-user's order history
	List<Ordermaster> findByUserId(Integer userId);
}
