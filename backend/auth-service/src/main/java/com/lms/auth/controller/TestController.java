package com.lms.auth.controller;

import com.lms.auth.entity.Test;
import com.lms.auth.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class TestController {

    @Autowired
    private TestRepository testRepository;

    @PostMapping
    public Test createTest(@RequestBody Test test) {
        return testRepository.save(test);
    }

    @GetMapping
    public List<Test> getAllTests(
            @RequestParam(required = false) String creatorId,
            @RequestParam(required = false) List<String> courses) {
        if (courses != null && !courses.isEmpty()) {
            return testRepository.findByCourseIn(courses);
        }
        if (creatorId != null) {
            return testRepository.findByCreatorId(creatorId);
        }
        return testRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTestById(@PathVariable Long id) {
        return testRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public Test updateTest(@PathVariable Long id, @RequestBody Test test) {
        test.setId(id);
        return testRepository.save(test);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Long id) {
        if (testRepository.existsById(id)) {
            testRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
