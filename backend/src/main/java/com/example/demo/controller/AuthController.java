package com.example.demo.controller;

import com.example.demo.dto.response.ApiResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User principal) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Not authenticated"));
        }

        String googleId = principal.getAttribute("sub");
        String email    = principal.getAttribute("email");
        String name     = principal.getAttribute("name");
        String picture  = principal.getAttribute("picture");

        // Find or create user in database
        User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
            User newUser = new User();
            newUser.setGoogleId(googleId);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setPicture(picture);
            newUser.setRole(User.Role.USER); // default role
            return userRepository.save(newUser);
        });

        // Update name/picture if changed
        if (!name.equals(user.getName()) || !picture.equals(user.getPicture())) {
            user.setName(name);
            user.setPicture(picture);
            userRepository.save(user);
        }

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("sub",     googleId);
        userInfo.put("name",    name);
        userInfo.put("email",   email);
        userInfo.put("picture", picture);
        userInfo.put("roles",   List.of(user.getRole().name()));

        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    // Admin can update user role
    @PatchMapping("/users/{googleId}/role")
    public ResponseEntity<ApiResponse<String>> updateRole(
            @PathVariable String googleId,
            @RequestParam String role,
            @AuthenticationPrincipal OAuth2User principal) {

        // Check if requester is admin
        String requesterId = principal.getAttribute("sub");
        User requester = userRepository.findByGoogleId(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (requester.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Only admins can change roles"));
        }

        User target = userRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        target.setRole(User.Role.valueOf(role.toUpperCase()));
        userRepository.save(target);

        return ResponseEntity.ok(ApiResponse.success("Role updated to " + role, null));
    }

    // Get all users (admin only)
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(
            @AuthenticationPrincipal OAuth2User principal) {

        String googleId = principal.getAttribute("sub");
        User requester = userRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (requester.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Only admins can view all users"));
        }

        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll()));
    }
}