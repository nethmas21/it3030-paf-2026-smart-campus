package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminSeedConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminSeedConfig.class);

    @Bean
    public CommandLineRunner adminSeeder(
            UserRepository userRepository,
            @Value("${app.admin.email:}") String adminEmail) {
        return args -> {
            String normalizedEmail = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
            if (normalizedEmail.isEmpty()) {
                log.info("Admin seed skipped because app.admin.email is not configured");
                return;
            }

            userRepository.findByEmail(normalizedEmail).ifPresentOrElse(user -> {
                if (user.getRole() != User.Role.ADMIN) {
                    user.setRole(User.Role.ADMIN);
                    userRepository.save(user);
                    log.info("Promoted {} to ADMIN at startup", normalizedEmail);
                } else {
                    log.info("{} is already ADMIN", normalizedEmail);
                }
            }, () -> log.warn("Admin seed email {} was not found. Sign in or register first, then restart.", normalizedEmail));
        };
    }
}
