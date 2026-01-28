package com.example.controller;

import com.example.config.JwtUtil;
import com.example.dto.LoginRequestDTO;
import com.example.dto.LoginResponseDTO;
import com.example.entity.User;
import com.example.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.service.EmailService; // Added by Hamzah


@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173") // adjust if needed
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    private final UserService userService;

    @Autowired
    private EmailService emailService; // Added by Hamzah


    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // ---------------- NORMAL REGISTER ----------------
    @PostMapping("/register")
    public LoginResponseDTO register(@RequestBody User user) {

        User savedUser = userService.register(user);

        LoginResponseDTO response = new LoginResponseDTO();
        response.setUserId(savedUser.getId());
        response.setFullName(savedUser.getFullName());
        response.setEmail(savedUser.getEmail());
        response.setMessage("Registration successful");

        return response;
    }

    // ---------------- NORMAL LOGIN ----------------
    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO dto) {

        User user = userService.login(dto.getEmail(), dto.getPassword());

        // Added by Hamzah - send login success email
        emailService.sendLoginSuccessMail(user);

        String token = jwtUtil.generateToken(user.getEmail());

        LoginResponseDTO response = new LoginResponseDTO();
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setToken(token);
        response.setMessage("Login successful");
 
        return response;
    }

    // ---------------- 🔥 GOOGLE LOGIN (SSO) ----------------
    @PostMapping("/google")
    public LoginResponseDTO googleLogin(@RequestBody GoogleLoginRequest request) {

        // Auto create user if first time, else fetch existing
        User user = userService.loginWithGoogle(
                request.getEmail(),
                request.getFullName());

        // Generate JWT
        String token = jwtUtil.generateToken(user.getEmail());

        LoginResponseDTO response = new LoginResponseDTO();
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setToken(token);
        response.setMessage("Google login successful");

        return response;
    }
}
