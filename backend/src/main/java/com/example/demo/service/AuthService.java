package com.example.demo.service;

import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.request.RegisterRequest;
import com.example.demo.dto.response.AuthResponse;
import com.example.demo.dto.response.UserProfileResponse;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail().trim().toLowerCase()).isPresent()) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setGoogleId(UUID.randomUUID().toString());
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setRole(User.Role.USER);

        return toAuthResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (user.getPasswordHash() == null) {
            throw new BadRequestException("This account uses Google sign-in");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(User user) {
        return toUserProfile(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    public User updateRole(String googleId, String role) {
        User target = userRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        try {
            target.setRole(User.Role.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported role: " + role);
        }

        return userRepository.save(target);
    }

    public User syncOAuthUser(String googleId, String email, String name, String picture) {
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setGoogleId(googleId);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setPicture(picture);
                    newUser.setAuthProvider(User.AuthProvider.GOOGLE);
                    newUser.setRole(User.Role.USER);
                    return userRepository.save(newUser);
                }));

        boolean changed = false;
        if (!name.equals(user.getName())) {
            user.setName(name);
            changed = true;
        }
        if (picture != null && !picture.equals(user.getPicture())) {
            user.setPicture(picture);
            changed = true;
        }
        if (user.getAuthProvider() != User.AuthProvider.GOOGLE) {
            user.setAuthProvider(User.AuthProvider.GOOGLE);
            changed = true;
        }
        if (changed) {
            user = userRepository.save(user);
        }

        return user;
    }

    private AuthResponse toAuthResponse(User user) {
        AuthResponse response = new AuthResponse();
        response.setToken(jwtService.generateToken(user));
        response.setUser(toUserProfile(user));
        return response;
    }

    private UserProfileResponse toUserProfile(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getGoogleId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPicture(user.getPicture());
        response.setRoles(List.of(user.getRole().name()));
        response.setAuthProvider(user.getAuthProvider().name());
        return response;
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setGoogleId(user.getGoogleId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPicture(user.getPicture());
        response.setRole(user.getRole());
        return response;
    }
}
