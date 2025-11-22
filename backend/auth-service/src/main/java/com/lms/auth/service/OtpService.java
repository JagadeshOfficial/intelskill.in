package com.lms.auth.service;

import com.lms.auth.entity.OtpStorage;
import com.lms.auth.repository.OtpStorageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpStorageRepository otpStorageRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    public String generateAndSendOtp(String email) throws Exception {
        // Check if OTP already exists and if max attempts exceeded
        Optional<OtpStorage> existingOtp = otpStorageRepository.findByEmail(email);
        if (existingOtp.isPresent()) {
            OtpStorage otp = existingOtp.get();
            if (otp.getAttempts() >= MAX_ATTEMPTS) {
                throw new Exception("Max OTP attempts exceeded. Please try again later.");
            }
        }

        // Generate 6-digit OTP
        String otp = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        // Save or update OTP
        OtpStorage otpStorage;
        if (existingOtp.isPresent()) {
            otpStorage = existingOtp.get();
            otpStorage.setOtp(otp);
            otpStorage.setExpiresAt(expiresAt);
        } else {
            otpStorage = new OtpStorage(email, otp, expiresAt);
        }
        otpStorageRepository.save(otpStorage);

        // Send OTP via email
        emailService.sendOtp(email, otp);

        return "OTP sent to " + email;
    }

    public boolean verifyOtp(String email, String otp) throws Exception {
        Optional<OtpStorage> otpStorageOpt = otpStorageRepository.findByEmail(email);

        if (otpStorageOpt.isEmpty()) {
            throw new Exception("No OTP found for this email");
        }

        OtpStorage otpStorage = otpStorageOpt.get();

        // Check if OTP expired
        if (LocalDateTime.now().isAfter(otpStorage.getExpiresAt())) {
            otpStorageRepository.delete(otpStorage);
            throw new Exception("OTP has expired");
        }

        // Check if OTP matches
        if (!otpStorage.getOtp().equals(otp)) {
            otpStorage.setAttempts(otpStorage.getAttempts() + 1);
            otpStorageRepository.save(otpStorage);
            throw new Exception("Invalid OTP");
        }

        // OTP verified, delete it
        otpStorageRepository.delete(otpStorage);
        return true;
    }

    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}
