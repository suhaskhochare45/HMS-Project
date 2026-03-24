package com.ers.ersbackend.service;

import com.ers.ersbackend.dto.RegisterRequest;
import com.ers.ersbackend.model.User;
import com.ers.ersbackend.model.Role;
import com.ers.ersbackend.repository.UserRepository;
import com.ers.ersbackend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ers.ersbackend.repository.RoleRepository;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    // Login method
    public String login(String email, String rawPassword) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new Exception("User not found with email: " + email);
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new Exception("Invalid password");
        }
        return jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().getName()   // ✅ PASS ROLE
        );
    }

    // Register new user
    public String registerUser(RegisterRequest request) throws Exception {

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new Exception("User already exists with email: " + request.getEmail());
        }

        // Convert DTO → Entity
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findById(request.getRole().toUpperCase())
            .orElseThrow(() -> new RuntimeException("Invalid role. Role must exist in DB."));
        user.setRole(role);

        userRepository.save(user);

        return "User registered successfully";
    }}