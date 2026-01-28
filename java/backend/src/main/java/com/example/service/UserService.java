package com.example.service;

import com.example.entity.User;
import java.util.List;
import com.example.dto.RegisterRequest;

public interface UserService {
    User saveUser(User user);

    List<User> getAllUsers();

    User getUserById(Integer id);

    void deleteUser(Integer id);

    User updateUser(Integer id, User updatedUser);

    User register(User user);

    User login(String email, String password);

    User loginWithGoogle(String email, String fullName);
}