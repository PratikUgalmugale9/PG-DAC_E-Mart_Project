package com.example.service;

import com.example.entity.User;
import com.example.exception.GlobalExceptionHandler;
import com.example.repository.UserRepository;
import org.springframework.stereotype.Service;


import java.util.List;

    @Service
    class UserServiceImpl implements UserService {

        private final UserRepository userRepository;

        public UserServiceImpl(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        private void validateUniqueFields(User user) {

            userRepository.findByEmail(user.getEmail())
                    .ifPresent(u -> {
                        throw new GlobalExceptionHandler.DuplicateFieldException(
                                "Email already exists: " + user.getEmail()
                        );
                    });

            userRepository.findByMobile(user.getMobile())
                    .ifPresent(u -> {
                        throw new GlobalExceptionHandler.DuplicateFieldException(
                                "Mobile number already exists: " + user.getMobile()
                        );
                    });
        }


        @Override
        public User saveUser(User user) {
            validateUniqueFields(user);
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
            userRepository.deleteById(id);
        }
}
