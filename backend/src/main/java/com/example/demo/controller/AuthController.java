package com.example.demo.controller;



import com.example.demo.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User principal) {

        if (principal == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Not authenticated"));
        }

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("sub",   principal.getAttribute("sub"));
        userInfo.put("name",  principal.getAttribute("name"));
        userInfo.put("email", principal.getAttribute("email"));
        userInfo.put("picture", principal.getAttribute("picture"));
        // Default role — you can expand this later
        userInfo.put("roles", java.util.List.of("USER"));

        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }
}
