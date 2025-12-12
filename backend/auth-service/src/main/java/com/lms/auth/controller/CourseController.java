package com.lms.auth.controller;

import com.lms.auth.entity.Course;
import com.lms.auth.entity.Batch;
import com.lms.auth.entity.Student;
import com.lms.auth.repository.CourseRepository;
import com.lms.auth.repository.BatchRepository;
import com.lms.auth.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private BatchRepository batchRepository;
    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Course> getAllCourses() {
        try {
            List<Course> courses = courseRepository.findAll();
            if (courses == null) {
                return List.of();
            }
            for (Course course : courses) {
                if (course.getBatches() == null) {
                    course.setBatches(new java.util.ArrayList<>());
                }
                for (Batch batch : course.getBatches()) {
                    if (batch.getStudents() == null) {
                        batch.setStudents(new java.util.ArrayList<>());
                    }
                }
            }
            return courses;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    @GetMapping("/{courseId}/batches")
    public List<Batch> getBatches(@PathVariable Long courseId) {
        Optional<Course> course = courseRepository.findById(courseId);
        return course.map(Course::getBatches).orElse(List.of());
    }

    @PostMapping("/{courseId}/batches")
    public Batch createBatch(@PathVariable Long courseId, @RequestBody Batch batch) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        batch.setCourse(course);
        Batch savedBatch = batchRepository.save(batch);
        course.getBatches().add(savedBatch);
        courseRepository.save(course);
        return savedBatch;
    }

    @PostMapping("/{courseId}/batches/{batchId}/students")
    public java.util.Map<String, Object> addStudentToBatch(@PathVariable Long courseId, @PathVariable Long batchId,
            @RequestBody String email) {
        try {
            Batch batch = batchRepository.findById(batchId).orElse(null);
            if (batch == null) {
                return java.util.Map.of("success", false, "message", "Batch not found");
            }
            Student student = studentRepository.findByEmail(email.replaceAll("\"", "")).orElse(null);
            if (student == null) {
                return java.util.Map.of("success", false, "message", "Student not found");
            }
            if (!batch.getStudents().contains(student)) {
                batch.getStudents().add(student);
                batchRepository.save(batch);
                return java.util.Map.of("success", true, "message", "Student added to batch");
            } else {
                return java.util.Map.of("success", false, "message", "Student already in batch");
            }
        } catch (Exception e) {
            return java.util.Map.of("success", false, "message", e.getMessage());
        }
    }

    @DeleteMapping("/{courseId}/batches/{batchId}/students/{email}")
    public java.util.Map<String, Object> removeStudentFromBatch(@PathVariable Long courseId, @PathVariable Long batchId,
            @PathVariable String email) {
        try {
            Batch batch = batchRepository.findById(batchId).orElse(null);
            if (batch == null) {
                return java.util.Map.of("success", false, "message", "Batch not found");
            }
            // Trim and lowercase email for matching
            String cleanEmail = email.trim().toLowerCase();
            Student student = studentRepository.findByEmail(cleanEmail).orElse(null);
            if (student == null) {
                return java.util.Map.of("success", false, "message", "Student not found");
            }
            if (batch.getStudents().contains(student)) {
                batch.getStudents().remove(student);
                batchRepository.save(batch);
                return java.util.Map.of("success", true, "message", "Student removed from batch");
            } else {
                return java.util.Map.of("success", false, "message", "Student not in batch");
            }
        } catch (Exception e) {
            return java.util.Map.of("success", false, "message", e.getMessage());
        }
    }

    @PutMapping("/{courseId}")
    public java.util.Map<String, Object> updateCourse(@PathVariable Long courseId,
            @RequestBody java.util.Map<String, Object> updates) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        if (updates.containsKey("title")) {
            course.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            course.setDescription((String) updates.get("description"));
        }
        courseRepository.save(course);
        return java.util.Map.of("success", true, "message", "Course updated successfully");
    }

    @DeleteMapping("/{courseId}")
    public java.util.Map<String, Object> deleteCourse(@PathVariable Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            return java.util.Map.of("success", false, "message", "Course not found");
        }
        courseRepository.deleteById(courseId);
        return java.util.Map.of("success", true, "message", "Course deleted successfully");
    }

    @GetMapping("/student/{email}")
    public List<Course> getStudentCourses(@PathVariable String email) {
        List<Course> allCourses = courseRepository.findAll();
        List<Course> studentCourses = new java.util.ArrayList<>();
        String cleanEmail = email.trim().toLowerCase();

        for (Course course : allCourses) {
            boolean isEnrolled = false;
            if (course.getBatches() != null) {
                for (Batch batch : course.getBatches()) {
                    if (batch.getStudents() != null) {
                        for (Student s : batch.getStudents()) {
                            if (s.getEmail().trim().toLowerCase().equals(cleanEmail)) {
                                isEnrolled = true;
                                break;
                            }
                        }
                    }
                    if (isEnrolled)
                        break;
                }
            }
            if (isEnrolled) {
                studentCourses.add(course);
            }
        }
        return studentCourses;
    }
}
