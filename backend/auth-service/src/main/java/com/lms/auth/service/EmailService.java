package com.lms.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@learnflow.com}")
    private String fromEmail;

    public void sendOtp(String email, String otp) throws Exception {
        // Validate input
        if (email == null || email.isEmpty()) {
            throw new Exception("Email address cannot be empty");
        }

        // Always log the OTP for development/testing so it can be retrieved from logs
        logger.info("OTP for {}: {}", email, otp);

        if (javaMailSender == null) {
            logger.error("JavaMailSender is not configured. Cannot send OTP to {}", email);
            throw new Exception("Email service not configured");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("LearnFlow - Email Verification OTP");
        message.setText("Your OTP for email verification is: " + otp + "\n\nThis OTP is valid for 5 minutes only.\n\nDo not share this OTP with anyone.");
        message.setFrom(fromEmail);

        try {
            logger.info("Sending OTP to email: {}", email);
            javaMailSender.send(message);
            logger.info("OTP sent successfully to email: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", email, e.getMessage(), e);
            // Propagate exception so callers (OTP controller) can return an error to frontend
            throw new Exception("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    public void sendSimpleEmail(String email, String subject, String body) throws Exception {
        if (javaMailSender == null) {
            logger.error("JavaMailSender is not configured. Cannot send email to {}", email);
            throw new Exception("Email service not configured");
        }

        if (email == null || email.isEmpty()) {
            throw new Exception("Email address cannot be empty");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom(fromEmail);

        try {
            logger.info("Sending email to: {} subject: {}", email, subject);
            javaMailSender.send(message);
            logger.info("Email sent successfully to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", email, e.getMessage(), e);
            throw new Exception("Failed to send email: " + e.getMessage(), e);
        }
    }
}
