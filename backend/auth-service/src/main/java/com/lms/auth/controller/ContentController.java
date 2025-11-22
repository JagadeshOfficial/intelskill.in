package com.lms.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/tutor/content")
public class ContentController {
    @Autowired
    private com.lms.auth.service.ContentService contentService;

    @Autowired
    private com.lms.auth.service.JwtTokenProvider jwtTokenProvider;

    // Added error handling and validation for metadata saving
    @PostMapping
    public ResponseEntity<?> addContent(@RequestHeader("Authorization") String authorization,
                                       @RequestBody Map<String, String> body) {
        try {
            Integer tutorId = jwtTokenProvider.getAdminIdFromToken(authorization.substring(7));
            String title = body.get("title");
            String description = body.get("description");
            String driveFileId = body.get("driveFileId");

            if (title == null || title.isEmpty() || driveFileId == null || driveFileId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid input data"));
            }

            contentService.saveContent(title, description, driveFileId, tutorId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Internal server error"));
        }
    }

    // Added endpoint to handle file uploads
    @PostMapping("/upload")
    public ResponseEntity<?> uploadContent(@RequestHeader("Authorization") String authorization,
                                            @RequestParam("file") MultipartFile file,
                                            @RequestParam("courseId") String courseId,
                                            @RequestParam("assignmentType") String assignmentType,
                                            @RequestParam(value = "studentId", required = false) String studentId) {
        try {
            Integer tutorId = jwtTokenProvider.getAdminIdFromToken(authorization.substring(7));

            if (file.isEmpty() || courseId == null || courseId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File and course are required"));
            }

            String driveFileId = contentService.uploadFileToDrive(file);
            contentService.saveContent(file.getOriginalFilename(), "Uploaded via form", driveFileId, tutorId);

            return ResponseEntity.ok(Map.of("success", true, "message", "File uploaded and metadata saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Internal server error"));
        }
    }
}
