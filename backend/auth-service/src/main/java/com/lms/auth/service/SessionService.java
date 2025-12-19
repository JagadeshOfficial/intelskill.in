package com.lms.auth.service;

import com.lms.auth.dto.SessionRequest;
import com.lms.auth.entity.Batch;
import com.lms.auth.entity.Course;
import com.lms.auth.entity.Session;
import com.lms.auth.entity.Student;
import com.lms.auth.entity.Tutor;
import com.lms.auth.repository.BatchRepository;
import com.lms.auth.repository.CourseRepository;
import com.lms.auth.repository.SessionRepository;
import com.lms.auth.repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private TutorRepository tutorRepository;

    public Session createSession(SessionRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        Tutor tutor = tutorRepository.findById(request.getTutorId())
                .orElseThrow(() -> new IllegalArgumentException("Tutor not found"));

        Session session = new Session();
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setCourse(course);
        session.setBatch(batch);
        session.setTutor(tutor);
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());

        // Auto-generate meeting link if not provided
        if (request.getMeetingLink() == null || request.getMeetingLink().trim().isEmpty()) {
            String uniqueId = java.util.UUID.randomUUID().toString();
            session.setMeetingLink("https://meet.jit.si/LearnFlow-Session-" + uniqueId);
        } else {
            session.setMeetingLink(request.getMeetingLink());
        }

        session.setStatus("SCHEDULED");

        return sessionRepository.save(session);
    }

    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public List<Session> getSessionsByTutor(Integer tutorId) {
        return sessionRepository.findByTutorId(tutorId);
    }

    @Transactional(readOnly = true)
    public List<Session> getSessionsByStudent(Integer studentId) {
        System.out.println("DEBUG: Fetching sessions for student ID: " + studentId);

        List<Batch> batches = new ArrayList<>();

        // Strategy 1: Explicit Join Query (Fast)
        try {
            batches = batchRepository.findBatchesForStudent(studentId);
            System.out.println("DEBUG: Strategy 1 found " + batches.size() + " batches.");
        } catch (Exception e) {
            System.out.println("DEBUG: Strategy 1 failed: " + e.getMessage());
        }

        // Strategy 2: Brute Force Fallback (Safe)
        if (batches.isEmpty()) {
            System.out.println("DEBUG: Attempting Strategy 2 (Brute Force Check)...");
            List<Batch> allBatches = batchRepository.findAll();
            for (Batch b : allBatches) {
                // Force load students
                if (b.getStudents() != null) {
                    for (Student s : b.getStudents()) {
                        if (s.getId().equals(studentId)) {
                            batches.add(b);
                            break;
                        }
                    }
                }
            }
            System.out.println("DEBUG: Strategy 2 found " + batches.size() + " batches.");
        }

        if (batches.isEmpty()) {
            System.out.println("DEBUG: No batches found for student " + studentId + ". Returning empty.");
            return java.util.Collections.emptyList();
        }

        List<Session> sessions = sessionRepository.findByBatchIn(batches);
        System.out.println("DEBUG: Found " + sessions.size() + " sessions.");
        return sessions;
    }

    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }
}
