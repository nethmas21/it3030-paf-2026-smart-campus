package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserRepository userRepository;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService())
                )
                .defaultSuccessUrl("http://localhost:3000/dashboard", true)
                .failureUrl("http://localhost:3000/login?error=true")
            )
            .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:3000/")
                .clearAuthentication(true)
                .invalidateHttpSession(true)
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

        return request -> {
            OAuth2User oauth2User = delegate.loadUser(request);

            String googleId = oauth2User.getAttribute("sub");
            String email    = oauth2User.getAttribute("email");
            String name     = oauth2User.getAttribute("name");
            String picture  = oauth2User.getAttribute("picture");

            // Find or create user in database
            User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
                User newUser = new User();
                newUser.setGoogleId(googleId);
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setPicture(picture);
                newUser.setRole(User.Role.USER);
                return userRepository.save(newUser);
            });

            // Update info if changed
            boolean changed = false;
            if (!name.equals(user.getName())) { user.setName(name); changed = true; }
            if (picture != null && !picture.equals(user.getPicture())) { user.setPicture(picture); changed = true; }
            if (changed) userRepository.save(user);

            // Set Spring Security authority from DB role
            String role = "ROLE_" + user.getRole().name();

            return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority(role)),
                oauth2User.getAttributes(),
                "sub"
            );
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}