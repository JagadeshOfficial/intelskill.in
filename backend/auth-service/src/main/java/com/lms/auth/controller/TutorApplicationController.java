package com.lms.auth.controller;

import com.lms.auth.entity.TutorApplication;
import com.lms.auth.repository.TutorApplicationRepository;
import com.lms.auth.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor-applications")
@CrossOrigin(origins = "http://localhost:3000") // Enable CORS for frontend
public class TutorApplicationController {

    @Autowired
    private TutorApplicationRepository repository;

    @Autowired
    private EmailService emailService;

    @Value("${admin.contact.email:admin@learnflow.com}")
    private String adminContactEmail;

    @Value("${admin.contact.phone:+1-555-0123}")
    private String adminContactPhone;

    @PostMapping
    public ResponseEntity<?> submitApplication(@RequestBody TutorApplication application) {
        try {
            application.setStatus(TutorApplication.ApplicationStatus.PENDING);
            application.setCreatedAt(LocalDateTime.now());
            TutorApplication saved = repository.save(application);

            // Send confirmation email to Tutor
            String subject = "Application Received - LearnFlow";
            String body = "Dear " + application.getFirstName() + ",\n\n" +
                    "We have successfully received your application to become an instructor at LearnFlow.\n" +
                    "Our team will review your qualifications and get back to you shortly.\n\n" +
                    "Thank you for your interest in joining our community.\n\n" +
                    "Best regards,\nThe LearnFlow Team";

            emailService.sendSimpleEmail(application.getEmail(), subject, body);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Application submitted successfully",
                    "id", saved.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to submit application: " + e.getMessage()));
        }
    }

    @GetMapping
    public List<TutorApplication> getAllApplications() {
        return repository.findAll(); // Or filter by status if needed
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Long id) {
        try {
            TutorApplication app = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            app.setStatus(TutorApplication.ApplicationStatus.APPROVED);
            repository.save(app);

            // Send Approval Email with Admin Contact Logic
            String subject = "Congratulations! Your Instructor Application is Approved";
            String body = "Dear " + app.getFirstName() + ",\n\n" +
                    "We are thrilled to inform you that your application to become a LearnFlow instructor has been approved!\n\n"
                    +
                    "We were impressed by your expertise and believe you will be a great addition to our teaching community.\n\n"
                    +
                    "**Next Steps:**\n" +
                    "Please contact our Admin team to finalize your onboarding and get your account set up.\n\n" +
                    "**Admin Contact Details:**\n" +
                    "Email: " + adminContactEmail + "\n" +
                    "Phone: " + adminContactPhone + "\n\n" +
                    "We look forward to working with you!\n\n" +
                    "Best regards,\nThe LearnFlow Team";

            emailService.sendSimpleEmail(app.getEmail(), subject, body);

            return ResponseEntity.ok(Map.of("success", true, "message", "Application approved and email sent"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long id) {
        try {
            TutorApplication app = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            app.setStatus(TutorApplication.ApplicationStatus.REJECTED);
            repository.save(app);

            // Optional: Send Rejection Email
            String subject = "Update on Your LearnFlow Application";
            String body = "Dear " + app.getFirstName() + ",\n\n" +
                    "Thank you for your interest in LearnFlow. After careful review, we are unable to proceed with your application at this time.\n\n"
                    +
                    "We appreciate the time you took to apply and wish you the best in your future endeavors.\n\n" +
                    "Sincerely,\nThe LearnFlow Team";
            try {
                emailService.sendSimpleEmail(app.getEmail(), subject, body);
            } catch (Exception ignored) {
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Application rejected"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
