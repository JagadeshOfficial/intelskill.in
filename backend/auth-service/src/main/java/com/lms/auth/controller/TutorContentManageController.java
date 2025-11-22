package com.lms.auth.controller;

import com.lms.auth.entity.TutorContent;
import com.lms.auth.repository.TutorContentRepository;
import com.lms.auth.service.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tutor/content")
public class TutorContentManageController {
    @Autowired
    private TutorContentRepository tutorContentRepository;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateContent(@RequestHeader("Authorization") String authorization,
                                           @PathVariable Integer id,
                                           @RequestBody Map<String, String> body) {
        Integer tutorId = jwtTokenProvider.getAdminIdFromToken(authorization.substring(7));
        TutorContent content = tutorContentRepository.findById(id).orElse(null);
        if (content == null || !content.getTutorId().equals(tutorId)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Not allowed"));
        }
        if (body.containsKey("title")) content.setTitle(body.get("title"));
        if (body.containsKey("description")) content.setDescription(body.get("description"));
        tutorContentRepository.save(content);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContent(@RequestHeader("Authorization") String authorization,
                                           @PathVariable Integer id) {
        Integer tutorId = jwtTokenProvider.getAdminIdFromToken(authorization.substring(7));
        TutorContent content = tutorContentRepository.findById(id).orElse(null);
        if (content == null || !content.getTutorId().equals(tutorId)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Not allowed"));
        }
        tutorContentRepository.delete(content);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
