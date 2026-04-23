package com.example.demo.security;

import com.example.demo.entity.User;
import com.example.demo.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtService jwtService;
    private final String frontendCallbackUrl;

    public OAuth2LoginSuccessHandler(AuthService authService,
                                     JwtService jwtService,
                                     @Value("${app.oauth2.redirect-url:http://localhost:3000/oauth/callback}") String frontendCallbackUrl) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.frontendCallbackUrl = frontendCallbackUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        User user = authService.syncOAuthUser(
                principal.getAttribute("sub"),
                principal.getAttribute("email"),
                principal.getAttribute("name"),
                principal.getAttribute("picture")
        );
        String token = jwtService.generateToken(user);
        String targetUrl = UriComponentsBuilder
                .fromUriString(frontendCallbackUrl)
                .queryParam("token", token)
                .build()
                .toUriString();
        response.sendRedirect(targetUrl);
    }
}
