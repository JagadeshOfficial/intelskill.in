// (Removed misplaced method, will add inside class below)
package com.lms.auth.controller;

import com.lms.auth.dto.*;
import com.lms.auth.entity.Tutor;
import com.lms.auth.service.OtpService;
import com.lms.auth.service.TutorService;
import com.lms.auth.service.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import com.lms.auth.service.FileStorageService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/tutor")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TutorAuthController {
    /**
     * Get tutor info by email (for internal service use)
     * GET /api/v1/tutor/by-email?email=...
     */
    @GetMapping("/by-email")
    public ResponseEntity<?> getTutorByEmail(@RequestParam("email") String email) {
        Optional<Tutor> tutorOpt = tutorService.findByEmail(email);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            Map<String, Object> body = new HashMap<>();
            body.put("id", tutor.getId());
            body.put("email", tutor.getEmail());
            body.put("firstName", tutor.getFirstName());
            body.put("lastName", tutor.getLastName());
            body.put("status", tutor.getStatus());
            body.put("verified", tutor.getVerified());
            return ResponseEntity.ok(body);
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Tutor not found"));
        }
    }

    @Autowired
    private TutorService tutorService;

    @Autowired
    private OtpService otpService;

    @Value("${app.dev.enable-otp-debug:false}")
    private boolean enableOtpDebug;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Step 1: Send OTP to email for verification
     */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }

            String message = otpService.generateAndSendOtp(email);
            response.put("success", true);
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Step 2: Verify OTP
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody OtpRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean verified = otpService.verifyOtp(request.getEmail(), request.getOtp());
            response.put("success", verified);
            response.put("message", "OTP verified successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Development-only: retrieve last OTP for an email (useful when SMTP not
    // configured)
    @GetMapping("/debug/last-otp")
    public ResponseEntity<Map<String, Object>> getLastOtp(@RequestParam("email") String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!enableOtpDebug) {
                response.put("success", false);
                response.put("message", "Not enabled");
                return ResponseEntity.status(403).body(response);
            }

            String otp = otpService.getLastOtp(email);
            response.put("success", true);
            response.put("otp", otp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Step 3: Register tutor (after OTP verification)
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerTutor(@RequestBody TutorRegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validate required fields
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (request.getPassword().length() < 6) {
                response.put("success", false);
                response.put("message", "Password must be at least 6 characters");
                return ResponseEntity.badRequest().body(response);
            }
            if (request.getFirstName() == null || request.getFirstName().isEmpty()) {
                response.put("success", false);
                response.put("message", "First name is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (request.getLastName() == null || request.getLastName().isEmpty()) {
                response.put("success", false);
                response.put("message", "Last name is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (request.getPhoneNumber() == null || request.getPhoneNumber().isEmpty()) {
                response.put("success", false);
                response.put("message", "Phone number is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (request.getExpertise() == null || request.getExpertise().isEmpty()) {
                response.put("success", false);
                response.put("message", "Expertise is required");
                return ResponseEntity.badRequest().body(response);
            }

            System.out.println("Registering tutor: " + request.getEmail());
            Tutor tutor = tutorService.registerTutor(request);
            response.put("success", true);
            response.put("message", "Tutor registered successfully. Pending admin approval.");
            response.put("tutorId", tutor.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error registering tutor: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Tutor Login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                response.put("success", false);
                response.put("message", "Email and password are required");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<Tutor> tutorOpt = tutorService.findByEmail(email);
            if (tutorOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }

            Tutor tutor = tutorOpt.get();

            // Check if verified
            if (!tutor.getVerified()) {
                response.put("success", false);
                response.put("message", "Email not verified");
                return ResponseEntity.badRequest().body(response);
            }

            // Check if approved by admin
            if (!tutor.getStatus().equals("APPROVED")) {
                response.put("success", false);
                response.put("message",
                        "Your account is " + tutor.getStatus().toLowerCase() + " and not yet approved for login");
                return ResponseEntity.badRequest().body(response);
            }

            // Verify password
            if (!passwordEncoder.matches(password, tutor.getPassword())) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }

            // Update last login
            tutorService.updateLastLogin(tutor.getId());

            // Generate token
            String token = tutorService.generateToken(tutor);

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("id", tutor.getId());
            response.put("email", tutor.getEmail());
            response.put("firstName", tutor.getFirstName());
            response.put("lastName", tutor.getLastName());
            response.put("role", "TUTOR");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get tutor profile (requires authentication)
     * GET /api/v1/tutor/me
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "Missing or invalid Authorization header");
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(response);
            }
            String token = authorization.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                response.put("success", false);
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(response);
            }

            Integer tutorId = jwtTokenProvider.getAdminIdFromToken(token); // token contains id in adminId claim
            if (tutorId == null) {
                response.put("success", false);
                response.put("message", "Invalid token payload");
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(response);
            }

            var opt = tutorService.getTutorById(tutorId);
            if (opt.isPresent()) {
                Tutor tutor = opt.get();
                var body = new java.util.HashMap<String, Object>();
                body.put("id", tutor.getId());
                body.put("email", tutor.getEmail());
                body.put("firstName", tutor.getFirstName());
                body.put("lastName", tutor.getLastName());
                body.put("mobileNumber", tutor.getPhoneNumber());
                body.put("expertise", tutor.getExpertise());
                body.put("bio", tutor.getBio());
                body.put("qualification", tutor.getQualification());
                body.put("experience", tutor.getExperience());
                body.put("hourlyRate", tutor.getHourlyRate());
                body.put("photoUrl", tutor.getPhotoUrl());
                body.put("status", tutor.getStatus());
                body.put("verified", tutor.getVerified());
                body.put("createdAt", convertDateTimeToArray(tutor.getCreatedAt()));
                body.put("updatedAt", convertDateTimeToArray(tutor.getUpdatedAt()));
                body.put("lastLogin", convertDateTimeToArray(tutor.getLastLogin()));
                body.put("success", true);
                body.put("message", "Profile retrieved successfully");
                return ResponseEntity.ok(body);
            } else {
                response.put("success", false);
                response.put("message", "Tutor not found");
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Convert LocalDateTime to number array format [year, month, day, hour, minute]
     */
    private Object convertDateTimeToArray(java.time.LocalDateTime dateTime) {
        if (dateTime == null)
            return null;
        return new int[] {
                dateTime.getYear(),
                dateTime.getMonthValue(),
                dateTime.getDayOfMonth(),
                dateTime.getHour(),
                dateTime.getMinute()
        };
    }

    /**
     * Update tutor profile (requires authentication)
     * PUT /api/v1/tutor/me
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody java.util.Map<String, String> updates) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Missing or invalid Authorization header"));
            }
            String token = authorization.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid or expired token"));
            }
            Integer tutorId = jwtTokenProvider.getAdminIdFromToken(token);
            if (tutorId == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid token payload"));
            }

            var updatedOpt = tutorService.updateTutorProfile(tutorId, updates);
            if (updatedOpt.isPresent()) {
                Tutor tutor = updatedOpt.get();
                var body = new java.util.HashMap<String, Object>();
                body.put("success", true);
                body.put("message", "Profile updated successfully");
                body.put("id", tutor.getId());
                body.put("firstName", tutor.getFirstName());
                body.put("lastName", tutor.getLastName());
                body.put("mobileNumber", tutor.getPhoneNumber());
                body.put("expertise", tutor.getExpertise());
                body.put("bio", tutor.getBio());
                body.put("qualification", tutor.getQualification());
                body.put("experience", tutor.getExperience());
                body.put("hourlyRate", tutor.getHourlyRate());
                body.put("photoUrl", tutor.getPhotoUrl());
                return ResponseEntity.ok(body);
            } else {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                        .body(java.util.Map.of("success", false, "message", "Tutor not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Upload tutor avatar
     * POST /api/v1/tutor/me/avatar
     */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadTutorAvatar(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("file") MultipartFile file) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Missing or invalid Authorization header"));
            }
            String token = authorization.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid or expired token"));
            }
            Integer tutorId = jwtTokenProvider.getAdminIdFromToken(token);
            if (tutorId == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid token payload"));
            }

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("success", false, "message", "File is required"));
            }

            String fileName = fileStorageService.storeFile(file, tutorId);
            Tutor tutor = tutorService.updateTutorPhotoUrl(tutorId, fileName);

            var body = new java.util.HashMap<String, Object>();
            body.put("success", true);
            body.put("message", "Avatar uploaded successfully");
            body.put("photoUrl", tutor.getPhotoUrl());
            body.put("id", tutor.getId());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Change password
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody java.util.Map<String, String> body) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Missing or invalid Authorization header"));
            }
            String token = authorization.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid or expired token"));
            }
            Integer tutorId = jwtTokenProvider.getAdminIdFromToken(token);
            if (tutorId == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid token payload"));
            }

            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("success", false, "message", "Missing password fields"));
            }

            tutorService.changePassword(tutorId, currentPassword, newPassword);

            var response = new java.util.HashMap<String, Object>();
            response.put("success", true);
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("success", false, "message", e.getMessage()));
        }
    }
}
