package com.example.controller;

import com.example.entity.Address;
import com.example.entity.User;
import com.example.repository.AddressRepository;
import com.example.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔹 SAVE ADDRESS DURING CHECKOUT
    @PostMapping("/add")
    public Address addAddress(
            @RequestBody Address address,
            Authentication authentication
    ) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        address.setUser(user);
        return addressRepository.save(address);
    }

    // 🔹 GET USER ADDRESSES
    @GetMapping("/my")
    public List<Address> getMyAddresses(Authentication authentication) {
        return addressRepository.findByUser_Email(authentication.getName());
    }
}
