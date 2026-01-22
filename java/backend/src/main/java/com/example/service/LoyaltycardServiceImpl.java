package com.example.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Loyaltycard;
import com.example.entity.User;
import com.example.repository.LoyaltycardRepository;
import com.example.repository.UserRepository;

@Service
public class LoyaltycardServiceImpl implements LoyaltycardService {

    @Autowired
    private LoyaltycardRepository loyaltycardRepository;

    @Autowired
    private UserRepository userRepository;

    // CREATE
    @Override
    public Loyaltycard createLoyaltycard(Loyaltycard loyaltycard) {

        Integer userId = loyaltycard.getUser().getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id " + userId));

        loyaltycard.setUser(user);

        return loyaltycardRepository.save(loyaltycard);
    }

    // READ BY ID
    @Override
    public Loyaltycard getLoyaltycardById(Integer id) {
        return loyaltycardRepository.findById(id).orElse(null);
    }

    // READ BY USER ID
    @Override
    public Loyaltycard getLoyaltycardByUserId(Integer userId) {
        return loyaltycardRepository.findByUser_Id(userId);
    }

    // READ ALL
    @Override
    public List<Loyaltycard> getAllLoyaltycards() {
        return loyaltycardRepository.findAll();
    }

    // UPDATE
    @Override
    public Loyaltycard updateLoyaltycard(Integer id, Loyaltycard loyaltycard) {

        Loyaltycard existing = loyaltycardRepository.findById(id).orElse(null);
        if (existing == null) return null;

        existing.setCardNumber(loyaltycard.getCardNumber());
        existing.setPointsBalance(loyaltycard.getPointsBalance());
        existing.setIssuedDate(loyaltycard.getIssuedDate());
        existing.setExpiryDate(loyaltycard.getExpiryDate());
        existing.setIsActive(loyaltycard.getIsActive());

        if (loyaltycard.getUser() != null) {
            Integer userId = loyaltycard.getUser().getId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            existing.setUser(user);
        }

        return loyaltycardRepository.save(existing);
    }

    // DELETE
    @Override
    public void deleteLoyaltycard(Integer id) {
        loyaltycardRepository.deleteById(id);
    }
}
