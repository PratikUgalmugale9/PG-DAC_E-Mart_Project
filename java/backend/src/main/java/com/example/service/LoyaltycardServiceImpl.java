package com.example.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ===================== CREATE =====================
    @Override
    public Loyaltycard createLoyaltycard(Loyaltycard loyaltycard) {

        if (loyaltycard.getUser() == null || loyaltycard.getUser().getId() == null) {
            throw new RuntimeException("User information is missing in loyalty card request");
        }

        Integer userId = loyaltycard.getUser().getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id " + userId));

        // Check if user already has a card
        Loyaltycard existingCard = loyaltycardRepository.findByUser_Id(userId);
        if (existingCard != null) {
            throw new RuntimeException("User already has a loyalty card");
        }

        loyaltycard.setUser(user);

        // Required logic for "Buy Loyalty Card" requirement
        loyaltycard.setPointsBalance(1000); // 1000 initial loyalty points
        loyaltycard.setIsActive('Y'); // Activated immediately
        loyaltycard.setIssuedDate(java.time.LocalDate.now());

        // Generate a random 16-digit card number
        String cardNumber = "LC" + (long) (Math.random() * 1_000_000_000_000_000L);
        loyaltycard.setCardNumber(cardNumber);

        return loyaltycardRepository.save(loyaltycard);
    }

    // ===================== READ =====================
    @Override
    public Loyaltycard getLoyaltycardById(Integer id) {
        return loyaltycardRepository.findById(id).orElse(null);
    }

    @Override
    public Loyaltycard getLoyaltycardByUserId(Integer userId) {
        return loyaltycardRepository.findByUser_Id(userId);
    }

    @Override
    public List<Loyaltycard> getAllLoyaltycards() {
        return loyaltycardRepository.findAll();
    }

    // ===================== UPDATE CARD DETAILS =====================
    @Override
    public Loyaltycard updateLoyaltycard(Integer id, Loyaltycard loyaltycard) {

        Loyaltycard existing = loyaltycardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loyalty card not found"));

        existing.setCardNumber(loyaltycard.getCardNumber());
        existing.setIssuedDate(loyaltycard.getIssuedDate());
        existing.setExpiryDate(loyaltycard.getExpiryDate());
        existing.setIsActive(loyaltycard.getIsActive());

        return loyaltycardRepository.save(existing);
    }

    // ===================== UPDATE POINTS (INTERNAL ONLY) =====================
    @Override
    @Transactional
    public void updatePoints(Integer userId, int pointsChange) {

        Loyaltycard card = loyaltycardRepository.findByUser_Id(userId);

        if (card == null) {
            throw new RuntimeException("Loyalty card not found for user " + userId);
        }

        if (card.getIsActive() == null ||
                !card.getIsActive().toString().equalsIgnoreCase("y")) {
            throw new RuntimeException("Loyalty card inactive");
        }

        Integer currentPoints = card.getPointsBalance();
        if (currentPoints == null) {
            currentPoints = 0;
        }

        int newBalance = currentPoints + pointsChange;

        if (newBalance < 0) {
            throw new RuntimeException("Insufficient loyalty points");
        }

        card.setPointsBalance(newBalance);
        loyaltycardRepository.save(card);
    }

    // ===================== DELETE =====================
    @Override
    public void deleteLoyaltycard(Integer id) {
        loyaltycardRepository.deleteById(id);
    }
}
