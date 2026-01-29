package com.example.service;

import com.example.entity.User;
import com.example.exception.GlobalExceptionHandler;
import com.example.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ---------------- HELPER ----------------

    private void validateUniqueFields(User user) {

        logger.debug("Validating unique fields for email: {}", user.getEmail());

        userRepository.findByEmail(user.getEmail())
                .ifPresent(u -> {
                    logger.warn("Duplicate email detected: {}", user.getEmail());
                    throw new GlobalExceptionHandler.DuplicateFieldException(
                            "Email already exists: " + user.getEmail());
                });

        if (user.getMobile() != null) {
            userRepository.findByMobile(user.getMobile())
                    .ifPresent(u -> {
                        logger.warn("Duplicate mobile detected: {}", user.getMobile());
                        throw new GlobalExceptionHandler.DuplicateFieldException(
                                "Mobile number already exists: " + user.getMobile());
                    });
        }
    }

    // ---------------- BASIC CRUD ----------------

    @Override
    public User saveUser(User user) {

        logger.info("Saving user with email: {}", user.getEmail());

        validateUniqueFields(user);

        if (user.getPasswordHash() != null) {
            logger.debug("Encoding password for user: {}", user.getEmail());
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }

        User savedUser = userRepository.save(user);
        logger.info("User saved successfully with id: {}", savedUser.getId());

        return savedUser;
    }

    @Override
    public List<User> getAllUsers() {
        logger.info("Fetching all users");
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Integer id) {

        logger.info("Fetching user with id: {}", id);

        return userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found with id: {}", id);
                    return new RuntimeException("User not found");
                });
    }

    @Override
    public void deleteUser(Integer id) {

        logger.info("Deleting user with id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Delete failed. User not found with id: {}", id);
                    return new RuntimeException("User not found");
                });

        userRepository.delete(user);
        logger.info("User deleted successfully with id: {}", id);
    }

    @Override
    public User updateUser(Integer id, User updatedUser) {

        logger.info("Updating user with id: {}", id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Update failed. User not found with id: {}", id);
                    return new RuntimeException("User not found");
                });

        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setMobile(updatedUser.getMobile());
        existingUser.setAddress(updatedUser.getAddress());

        User savedUser = userRepository.save(existingUser);
        logger.info("User updated successfully with id: {}", savedUser.getId());

        return savedUser;
    }

    // ---------------- REGISTER ----------------

    @Override
    public User register(User user) {

        logger.info("Registering user with email: {}", user.getEmail());

        if (userRepository.existsByEmail(user.getEmail())) {
            logger.warn("Registration failed. Email already exists: {}", user.getEmail());
            throw new RuntimeException("Email already registered");
        }

        user.setProvider("LOCAL");
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with id: {}", savedUser.getId());

        return savedUser;
    }

    // ---------------- LOGIN ----------------

    @Override
    public User login(String email, String password) {

        logger.info("Login attempt for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Login failed. User not found: {}", email);
                    return new RuntimeException("User not found");
                });

        if ("GOOGLE".equals(user.getProvider())) {
            logger.warn("Blocked normal login for GOOGLE user: {}", email);
            throw new RuntimeException("Please login using Google");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            logger.warn("Invalid password for email: {}", email);
            throw new RuntimeException("Invalid credentials");
        }

        logger.info("Login successful for user id: {}", user.getId());
        return user;
    }

    // ---------------- GOOGLE LOGIN ----------------

    @Override
    public User loginWithGoogle(String email, String fullName) {

        logger.info("Google login attempt for email: {}", email);

        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    logger.info("First-time Google login. Creating new user: {}", email);

                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName(fullName);
                    newUser.setProvider("GOOGLE");
                    newUser.setPasswordHash(null);

                    return userRepository.save(newUser);
                });
    }
}
