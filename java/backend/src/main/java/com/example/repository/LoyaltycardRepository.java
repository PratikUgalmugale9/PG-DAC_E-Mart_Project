package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.entity.Loyaltycard;

@Repository
public interface LoyaltycardRepository extends JpaRepository<Loyaltycard, Integer> {

    Loyaltycard findByUser_Id(Integer userId);
}
