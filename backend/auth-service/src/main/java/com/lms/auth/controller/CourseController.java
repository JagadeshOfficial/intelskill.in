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
@CrossOrigin(origins = "*")
public class CourseController {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private BatchRepository batchRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private com.lms.auth.repository.TutorRepository tutorRepository;

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
            System.out.println("Returning " + courses.size() + " courses.");
            return courses;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch courses: " + e.getMessage());
        }
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<?> createCourse(@RequestBody java.util.Map<String, String> payload) {
        try {
            String title = payload.get("title");
            String description = payload.get("description");

            if (title == null || title.trim().isEmpty()) {
                return org.springframework.http.ResponseEntity.badRequest()
                        .body(java.util.Map.of("message", "Course title cannot be empty"));
            }

            Course course = new Course();
            course.setTitle(title);
            course.setDescription(description);

            System.out.println("Received request to create course: " + title);
            Course saved = courseRepository.save(course);
            System.out.println("Course saved successfully with ID: " + saved.getId());
            return org.springframework.http.ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500)
                    .body(java.util.Map.of("message", "Failed to save course: " + e.getMessage()));
        }
    }

    @GetMapping("/{courseId}/batches")
    public List<Batch> getBatches(@PathVariable Long courseId) {
        return batchRepository.findByCourseId(courseId);
    }

    @PostMapping("/{courseId}/batches")
    public Batch createBatch(@PathVariable Long courseId, @RequestBody java.util.Map<String, String> payload) {
        String name = payload.get("name");
        System.out.println("Received request to create batch: " + name + " for course: " + courseId);

        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));

        Batch batch = new Batch();
        batch.setName(name);
        batch.setCourse(course);

        Batch saved = batchRepository.save(batch);
        System.out.println("Batch saved with ID: " + saved.getId());
        return saved;
    }

    @PutMapping("/{courseId}/batches/{batchId}")
    public java.util.Map<String, Object> updateBatch(@PathVariable Long courseId, @PathVariable Long batchId,
            @RequestBody java.util.Map<String, Object> updates) {
        try {
            Batch batch = batchRepository.findById(batchId).orElse(null);
            if (batch == null) {
                return java.util.Map.of("success", false, "message", "Batch not found");
            }
            if (updates.containsKey("name")) {
                batch.setName((String) updates.get("name"));
            }
            batchRepository.save(batch);
            return java.util.Map.of("success", true, "message", "Batch updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return java.util.Map.of("success", false, "message", e.getMessage());
        }
    }

    @DeleteMapping("/{courseId}/batches/{batchId}")
    public java.util.Map<String, Object> deleteBatch(@PathVariable Long courseId, @PathVariable Long batchId) {
        try {
            if (!batchRepository.existsById(batchId)) {
                return java.util.Map.of("success", false, "message", "Batch not found");
            }
            // Remove batch from course if present
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isPresent()) {
                Course course = courseOpt.get();
                course.getBatches().removeIf(b -> b.getId().equals(batchId));
                courseRepository.save(course);
            }
            batchRepository.deleteById(batchId);
            return java.util.Map.of("success", true, "message", "Batch deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return java.util.Map.of("success", false, "message", e.getMessage());
        }
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
        // Force initialization for serialization
        for (Course c : studentCourses) {
            if (c.getBatches() == null) {
                c.setBatches(new java.util.ArrayList<>());
            } else {
                // Trigger lazy loading if necessary or just ensure they are valid for
                // serialization
                c.getBatches().size();
                for (Batch b : c.getBatches()) {
                    if (b.getStudents() == null) {
                        b.setStudents(new java.util.ArrayList<>());
                    } else {
                        b.getStudents().size(); // Trigger lazy load
                    }
                }
            }
        }
        return studentCourses;
    }

    @PostMapping("/{courseId}/tutors")
    public java.util.Map<String, Object> assignTutorToCourse(@PathVariable Long courseId,
            @RequestBody java.util.Map<String, Object> payload) {
        try {
            Integer tutorId = Integer.valueOf(payload.get("tutorId").toString());
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            com.lms.auth.entity.Tutor tutor = tutorRepository.findById(tutorId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            tutor.getCourses().add(course);
            tutorRepository.save(tutor);

            return java.util.Map.of("success", true, "message", "Tutor assigned to course");
        } catch (Exception e) {
            e.printStackTrace();
            return java.util.Map.of("success", false, "message", e.getMessage());
        }
    }

    @DeleteMapping("/{courseId}/tutors/{tutorId}")
    public java.util.Map<String, Object> removeTutorFromCourse(@PathVariable Long courseId,
            @PathVariable Integer tutorId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            com.lms.auth.entity.Tutor tutor = tutorRepository.findById(tutorId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            tutor.getCourses().remove(course);
            tutorRepository.save(tutor);

            return java.util.Map.of("success", true, "message", "Tutor removed from course");
        } catch (Exception e) {
            return java.util.Map.of("success", false, "message", e.getMessage());
        }
    }

    @GetMapping("/tutors/{tutorId}")
    public List<Course> getCoursesForTutor(@PathVariable Integer tutorId) {
        try {
            System.out.println("Fetching courses for tutor ID: " + tutorId);
            List<Course> courses = courseRepository.findCoursesByTutorId(tutorId);
            System.out.println("Found " + (courses != null ? courses.size() : 0) + " courses.");

            if (courses != null) {
                for (Course course : courses) {
                    // Force initialization of batches
                    if (course.getBatches() == null) {
                        course.setBatches(new java.util.ArrayList<>());
                    } else {
                        course.getBatches().size(); // Trigger lazy load
                        for (Batch batch : course.getBatches()) {
                            if (batch.getStudents() != null)
                                batch.getStudents().size(); // Trigger nested
                        }
                    }
                }
                return courses;
            }
            return List.of();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    @GetMapping("/{courseId}/tutors")
    public List<com.lms.auth.entity.Tutor> getTutorsForCourse(@PathVariable Long courseId) {
        return tutorRepository.findAll().stream()
                .filter(t -> t.getCourses().stream().anyMatch(c -> c.getId().equals(courseId)))
                .collect(java.util.stream.Collectors.toList());
    }
}
