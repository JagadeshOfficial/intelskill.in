package com.lms.auth.controller;

import com.lms.auth.dto.*;
import com.lms.auth.entity.Student;
import com.lms.auth.service.OtpService;
import com.lms.auth.service.StudentService;
import com.lms.auth.service.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/api/v1/student")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" }, maxAge = 3600)
public class StudentAuthController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private FileStorageService fileStorageService;

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

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody OtpRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean verified = otpService.verifyOtp(request.getEmail(), request.getOtp());
            response.put("success", verified);
            response.put("message", verified ? "OTP verified successfully" : "Invalid OTP");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerStudent(@RequestBody StudentRegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
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

            Student student = studentService.registerStudent(request);
            response.put("success", true);
            response.put("message", "Student registered successfully.");
            response.put("studentId", student.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

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
            Optional<Student> opt = studentService.findByEmail(email);
            if (opt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }
            Student student = opt.get();
            if (!student.getVerified()) {
                response.put("success", false);
                response.put("message", "Email not verified");
                return ResponseEntity.badRequest().body(response);
            }
            if (!passwordEncoder.matches(password, student.getPassword())) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.badRequest().body(response);
            }

            studentService.updateLastLogin(student.getId());
            String token = studentService.generateToken(student);

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("id", student.getId());
            response.put("email", student.getEmail());
            response.put("firstName", student.getFirstName());
            response.put("lastName", student.getLastName());
            response.put("role", "STUDENT");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

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

            Integer studentId = jwtTokenProvider.getAdminIdFromToken(token);
            if (studentId == null) {
                response.put("success", false);
                response.put("message", "Invalid token payload");
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(response);
            }

            var opt = studentService.getStudentById(studentId);
            if (opt.isPresent()) {
                Student s = opt.get();
                var body = new java.util.HashMap<String, Object>();
                body.put("id", s.getId());
                body.put("email", s.getEmail());
                body.put("firstName", s.getFirstName());
                body.put("lastName", s.getLastName());
                body.put("mobileNumber", s.getPhoneNumber());
                body.put("photoUrl", s.getPhotoUrl());
                body.put("status", s.getStatus());
                body.put("verified", s.getVerified());
                body.put("createdAt", convertDateTimeToArray(s.getCreatedAt()));
                body.put("updatedAt", convertDateTimeToArray(s.getUpdatedAt()));
                body.put("lastLogin", convertDateTimeToArray(s.getLastLogin()));
                body.put("success", true);
                body.put("message", "Profile retrieved successfully");
                return ResponseEntity.ok(body);
            } else {
                response.put("success", false);
                response.put("message", "Student not found");
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Object convertDateTimeToArray(java.time.LocalDateTime dateTime) {
        if (dateTime == null)
            return null;
        return new int[] { dateTime.getYear(), dateTime.getMonthValue(), dateTime.getDayOfMonth(), dateTime.getHour(),
                dateTime.getMinute() };
    }

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
            Integer studentId = jwtTokenProvider.getAdminIdFromToken(token);
            if (studentId == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid token payload"));
            }

            var updatedOpt = studentService.updateStudentProfile(studentId, updates);
            if (updatedOpt.isPresent()) {
                Student s = updatedOpt.get();
                var body = new java.util.HashMap<String, Object>();
                body.put("success", true);
                body.put("message", "Profile updated successfully");
                body.put("id", s.getId());
                body.put("firstName", s.getFirstName());
                body.put("lastName", s.getLastName());
                body.put("mobileNumber", s.getPhoneNumber());
                body.put("photoUrl", s.getPhotoUrl());
                return ResponseEntity.ok(body);
            } else {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                        .body(java.util.Map.of("success", false, "message", "Student not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadStudentAvatar(
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
            Integer studentId = jwtTokenProvider.getAdminIdFromToken(token);
            if (studentId == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid token payload"));
            }

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("success", false, "message", "File is required"));
            }

            String fileName = fileStorageService.storeFile(file, studentId);
            Student s = studentService.updateStudentPhotoUrl(studentId, fileName);

            var body = new java.util.HashMap<String, Object>();
            body.put("success", true);
            body.put("message", "Avatar uploaded successfully");
            body.put("photoUrl", s.getPhotoUrl());
            body.put("id", s.getId());
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
            Integer studentId = jwtTokenProvider.getAdminIdFromToken(token);
            if (studentId == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(java.util.Map.of("success", false, "message", "Invalid token payload"));
            }

            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("success", false, "message", "Missing password fields"));
            }

            studentService.changePassword(studentId, currentPassword, newPassword);

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
