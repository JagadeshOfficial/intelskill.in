package com.lms.auth.controller;

import com.lms.auth.dto.SessionDTO;
import com.lms.auth.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sessions")
@CrossOrigin(origins = "*") // Adjust for production
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionDTO> createSession(@RequestBody SessionDTO sessionDTO) {
        return ResponseEntity.ok(sessionService.createSession(sessionDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionDTO> updateSession(@PathVariable Long id, @RequestBody SessionDTO sessionDTO) {
        return ResponseEntity.ok(sessionService.updateSession(id, sessionDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<SessionDTO>> getSessionsByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(sessionService.getSessionsByBatch(batchId));
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<SessionDTO>> getSessionsByTutor(@PathVariable Integer tutorId) {
        return ResponseEntity.ok(sessionService.getSessionsByTutor(tutorId));
    }

    @GetMapping
    public ResponseEntity<List<SessionDTO>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }
}
