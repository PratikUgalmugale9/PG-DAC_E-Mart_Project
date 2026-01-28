package com.example.service;

import com.example.dto.RegisterRequest;
import com.example.entity.User;
import com.example.exception.GlobalExceptionHandler;
import com.example.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ---------------- HELPER ----------------

    private void validateUniqueFields(User user) {

        userRepository.findByEmail(user.getEmail())
                .ifPresent(u -> {
                    throw new GlobalExceptionHandler.DuplicateFieldException(
                            "Email already exists: " + user.getEmail());
                });

        if (user.getMobile() != null) {
            userRepository.findByMobile(user.getMobile())
                    .ifPresent(u -> {
                        throw new GlobalExceptionHandler.DuplicateFieldException(
                                "Mobile number already exists: " + user.getMobile());
                    });
        }
    }

    // ---------------- BASIC CRUD ----------------

    @Override
    public User saveUser(User user) {
        validateUniqueFields(user);

        // 🔐 Encode password before storing (only if present)
        if (user.getPasswordHash() != null) {
            user.setPasswordHash(
                    passwordEncoder.encode(user.getPasswordHash()));
        }

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public User updateUser(Integer id, User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update allowed fields only
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setMobile(updatedUser.getMobile());
        existingUser.setAddress(updatedUser.getAddress());

        return userRepository.save(existingUser);
    }

    // ---------------- NORMAL REGISTER (LOCAL USER) ----------------

    @Override
    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // 🔥 VERY IMPORTANT — SET PROVIDER
        user.setProvider("LOCAL");

        // 🔐 HASH PASSWORD
        user.setPasswordHash(
                passwordEncoder.encode(user.getPasswordHash()));

        User savedUser = userRepository.save(user);

        return savedUser;
    }

    // ---------------- NORMAL LOGIN ----------------

    @Override
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔴 If this is a GOOGLE user, block normal login
        if ("GOOGLE".equals(user.getProvider())) {
            throw new RuntimeException("Please login using Google");
        }

        // 🔐 VERIFY PASSWORD
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user; // JWT will be generated in controller
    }

    // ---------------- GOOGLE LOGIN (SSO) ----------------

    @Override
    public User loginWithGoogle(String email, String fullName) {

        // Check if user already exists
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // 🔥 First time Google user → create new account automatically
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName(fullName);
                    newUser.setProvider("GOOGLE");
                    newUser.setPasswordHash(null); // no password for Google users

                    return userRepository.save(newUser);
                });
    }
}
