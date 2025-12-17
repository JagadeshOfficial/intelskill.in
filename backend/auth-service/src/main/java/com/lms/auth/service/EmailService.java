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

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendOtp(String email, String otp) throws Exception {
        // Validate input
        if (email == null || email.isEmpty()) {
            throw new Exception("Email address cannot be empty");
        }

        // Always log the OTP for development/testing so it can be retrieved from logs
        logger.info("OTP for {}: {}", email, otp);

        // If JavaMailSender is not configured or MAIL_PASSWORD is empty, don't attempt
        // to send email.
        // This makes local development easier: OTP is still generated and logged but
        // won't fail the flow.
        // Check configuration
        if (javaMailSender == null || mailPassword == null || mailPassword.isBlank()) {
            logger.warn("Skipping email send. JavaMailSender present: {}, Password set: {} (len={})",
                    (javaMailSender != null),
                    (mailPassword != null && !mailPassword.isBlank()),
                    (mailPassword != null ? mailPassword.length() : 0));
            logger.warn(
                    "NOTE: Check your .env file. Ensure MAIL_PASSWORD is set. If utilizing 2FA, use an App Password.");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("LearnFlow - Email Verification OTP");
        message.setText("Your OTP for email verification is: " + otp
                + "\n\nThis OTP is valid for 5 minutes only.\n\nDo not share this OTP with anyone.");
        message.setFrom(fromEmail);

        try {
            logger.info("Attempting to send OTP email to: {}", email);
            logger.info("Debug: Using From: {}, Password Length: {} (starts with '{}')", fromEmail,
                    (mailPassword != null ? mailPassword.length() : "null"),
                    (mailPassword != null && !mailPassword.isEmpty() ? mailPassword.charAt(0) : "?"));
            javaMailSender.send(message);
            logger.info("OTP sent successfully to email: {}", email);
        } catch (org.springframework.mail.MailAuthenticationException ae) {
            logger.error("AUTHENTICATION FAILED sending email to {}. Error: {}", email, ae.getMessage());
            logger.error(
                    "HINT: If you are using Gmail with 2FA enabled, you MUST use an App Password, not your regular password.");
            logger.error("Generate an App Password here: https://myaccount.google.com/apppasswords");
            throw new Exception("Email Authentication Failed. Check server logs for App Password instructions.", ae);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", email, e.getMessage(), e);
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
