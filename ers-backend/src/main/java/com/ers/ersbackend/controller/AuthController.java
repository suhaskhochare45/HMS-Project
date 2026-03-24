package com.ers.ersbackend.controller;

import com.ers.ersbackend.dto.LoginRequest;
import com.ers.ersbackend.dto.RegisterRequest;
import com.ers.ersbackend.service.UserService;
import com.ers.ersbackend.model.User;
import com.ers.ersbackend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) throws Exception {
        return userService.registerUser(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) throws Exception {
        return userService.login(request.getEmail(), request.getPassword());
    }

    @GetMapping("/me")
    public User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Not authenticated");
        }
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
    }
}