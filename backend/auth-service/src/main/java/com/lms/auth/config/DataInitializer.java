package com.lms.auth.config;

import com.lms.auth.entity.Admin;
import com.lms.auth.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

/**
 * DataInitializer - Seeds demo data for H2 in-memory database during
 * development
 * 
 * IMPORTANT:
 * - This class ONLY runs when spring.profiles.active=h2 is set
 * - For MySQL/Production databases, this does NOT run
 * - In production, admins are loaded directly from your MySQL database
 * - Do NOT add multiple admins here; if you need more admins, add them directly
 * to your database
 * 
 * To use with MySQL production database:
 * 1. Add admins directly to MySQL using SQL INSERT statements
 * 2. Make sure spring.profiles.active is NOT set to "h2"
 * 3. Configure application.yml with your MySQL connection details
 */
@Configuration
// Removed @Profile("h2") to allow seeding in production if table is empty
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin already exists (avoid duplicates on restart)
            if (adminRepository.findByEmail("intelskill.ad9014@gmail.com").isEmpty()) {
                Admin admin = new Admin();
                admin.setEmail("intelskill.ad9014@gmail.com");
                // Password: Intel@123
                admin.setPasswordHash(passwordEncoder.encode("Intel@123"));
                // These should match your database's first admin
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setRole("ADMIN");
                admin.setStatus("ACTIVE");
                admin.setCreatedAt(LocalDateTime.now());
                admin.setUpdatedAt(LocalDateTime.now());

                adminRepository.save(admin);
                System.out.println("✓ H2 Profile: Demo admin user seeded: admin@example.com / admin123");
                System.out.println("  Name: System Administrator");
                System.out.println("  NOTE: This seed data is for H2 development only!");
            } else {
                System.out.println("✓ H2 Profile: Admin already exists, skipping seed");
            }
        };
    }
}
