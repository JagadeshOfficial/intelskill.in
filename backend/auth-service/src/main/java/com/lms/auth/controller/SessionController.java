package com.lms.auth.controller;

import com.lms.auth.dto.SessionRequest;
import com.lms.auth.entity.Session;
import com.lms.auth.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sessions")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody SessionRequest request) {
        try {
            Session session = sessionService.createSession(request);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "Session created successfully", "session", session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Session>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Session>> getSessionsByTutor(@PathVariable Integer tutorId) {
        return ResponseEntity.ok(sessionService.getSessionsByTutor(tutorId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Session>> getSessionsByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(sessionService.getSessionsByStudent(studentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id) {
        try {
            sessionService.deleteSession(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Session deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
