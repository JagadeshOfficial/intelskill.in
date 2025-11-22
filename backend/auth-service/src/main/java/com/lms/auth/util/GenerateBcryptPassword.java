package com.lms.auth.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBcryptPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        
        String[] passwords = {"admin123", "password123", "user123"};
        
        for (String password : passwords) {
            String hash = encoder.encode(password);
            System.out.println("Password: " + password + " => " + hash);
        }
    }
}
