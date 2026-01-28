package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.Loyaltycard;
import com.example.service.LoyaltycardService;

@RestController
@RequestMapping("/loyaltycard")
public class LoyaltycardController {

    @Autowired
    private LoyaltycardService loyaltycardService;

    // ===================== CREATE =====================
    @PostMapping
    public Loyaltycard create(@RequestBody Loyaltycard loyaltycard) {
        return loyaltycardService.createLoyaltycard(loyaltycard);
    }

    // ===================== READ BY ID =====================
    @GetMapping("/{id}")
    public Loyaltycard getById(@PathVariable Integer id) {
        return loyaltycardService.getLoyaltycardById(id);
    }

    // ===================== READ BY USER ID =====================
    @GetMapping("/user/{userId}")
    public Loyaltycard getByUserId(@PathVariable Integer userId) {
        return loyaltycardService.getLoyaltycardByUserId(userId);
    }

    // ===================== READ ALL =====================
    @GetMapping
    public List<Loyaltycard> getAll() {
        return loyaltycardService.getAllLoyaltycards();
    }

    // ===================== UPDATE CARD DETAILS =====================
    @PutMapping("/{id}")
    public Loyaltycard update(
            @PathVariable Integer id,
            @RequestBody Loyaltycard loyaltycard) {
        return loyaltycardService.updateLoyaltycard(id, loyaltycard);
    }

    // ===================== DELETE =====================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        loyaltycardService.deleteLoyaltycard(id);
    }
}
