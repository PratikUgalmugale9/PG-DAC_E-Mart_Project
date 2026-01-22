package com.example.service;

import java.util.List;
import com.example.entity.Loyaltycard;

public interface LoyaltycardService {

    // CREATE
    Loyaltycard createLoyaltycard(Loyaltycard loyaltycard);

    // READ
    Loyaltycard getLoyaltycardById(Integer id);
    Loyaltycard getLoyaltycardByUserId(Integer userId);
    List<Loyaltycard> getAllLoyaltycards();

    // UPDATE
    Loyaltycard updateLoyaltycard(Integer id, Loyaltycard loyaltycard);

    // DELETE
    void deleteLoyaltycard(Integer id);
}
