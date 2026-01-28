package com.example.service;

import java.util.List;

import com.example.entity.Loyaltycard;

public interface LoyaltycardService {

    // CRUD
    Loyaltycard createLoyaltycard(Loyaltycard loyaltycard);
    Loyaltycard getLoyaltycardById(Integer id);
    Loyaltycard getLoyaltycardByUserId(Integer userId);
    List<Loyaltycard> getAllLoyaltycards();
    Loyaltycard updateLoyaltycard(Integer id, Loyaltycard loyaltycard);
    void deleteLoyaltycard(Integer id);

    // 🔒 INTERNAL USE (PaymentService will call this)
    void updatePoints(Integer userId, int pointsChange);
}
