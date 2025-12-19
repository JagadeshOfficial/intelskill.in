package com.lms.auth.controller;

import com.lms.auth.entity.Assignment;
import com.lms.auth.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @PostMapping
    public Assignment createAssignment(@RequestBody Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @GetMapping
    public List<Assignment> getAllAssignments(
            @RequestParam(required = false) String creatorId,
            @RequestParam(required = false) List<String> courses) {
        if (courses != null && !courses.isEmpty()) {
            return assignmentRepository.findByCourseIn(courses);
        }
        if (creatorId != null) {
            return assignmentRepository.findByCreatorId(creatorId);
        }
        return assignmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable Long id) {
        return assignmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public Assignment updateAssignment(@PathVariable Long id, @RequestBody Assignment assignment) {
        assignment.setId(id);
        return assignmentRepository.save(assignment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        if (assignmentRepository.existsById(id)) {
            assignmentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
