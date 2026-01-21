package com.example.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.entity.Loyaltycard;
import com.example.service.LoyaltycardService;

@RestController
@RequestMapping("/loyaltycard")
public class LoyaltycardController {

    @Autowired
    private LoyaltycardService loyaltycardService;

    // CREATE
    @PostMapping
    public Loyaltycard create(@RequestBody Loyaltycard loyaltycard) {
        return loyaltycardService.createLoyaltycard(loyaltycard);
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Loyaltycard getById(@PathVariable Integer id) {
        return loyaltycardService.getLoyaltycardById(id);
    }

    // READ BY USER ID
    @GetMapping("/user/{userId}")
    public Loyaltycard getByUserId(@PathVariable Integer userId) {
        return loyaltycardService.getLoyaltycardByUserId(userId);
    }

    // READ ALL
    @GetMapping
    public List<Loyaltycard> getAll() {
        return loyaltycardService.getAllLoyaltycards();
    }

    // UPDATE
    @PutMapping("/{id}")
    public Loyaltycard update(
            @PathVariable Integer id,
            @RequestBody Loyaltycard loyaltycard) {
        return loyaltycardService.updateLoyaltycard(id, loyaltycard);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        loyaltycardService.deleteLoyaltycard(id);
    }
}
