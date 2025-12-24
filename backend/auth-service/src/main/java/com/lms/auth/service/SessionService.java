package com.lms.auth.service;

import com.lms.auth.dto.SessionDTO;
import com.lms.auth.entity.Batch;
import com.lms.auth.entity.Session;
import com.lms.auth.entity.Tutor;
import com.lms.auth.repository.BatchRepository;
import com.lms.auth.repository.SessionRepository;
import com.lms.auth.repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private TutorRepository tutorRepository;

    public SessionDTO createSession(SessionDTO sessionDTO) {
        if (sessionDTO.getBatchId() == null) {
            throw new RuntimeException("Batch ID is required");
        }
        if (sessionDTO.getTutorId() == null) {
            throw new RuntimeException("Tutor ID is required");
        }

        Batch batch = batchRepository.findById(sessionDTO.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found with ID: " + sessionDTO.getBatchId()));
        Tutor tutor = tutorRepository.findById(sessionDTO.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + sessionDTO.getTutorId()));

        Session session = new Session();
        session.setTitle(sessionDTO.getTitle());
        session.setDescription(sessionDTO.getDescription());
        session.setSessionLink(sessionDTO.getSessionLink());

        try {
            session.setStartTime(LocalDateTime.parse(sessionDTO.getStartTime()));
            session.setEndTime(LocalDateTime.parse(sessionDTO.getEndTime()));
        } catch (Exception e) {
            throw new RuntimeException("Date parsing error: " + e.getMessage() + ". Input was Start: "
                    + sessionDTO.getStartTime() + ", End: " + sessionDTO.getEndTime());
        }

        session.setBatch(batch);
        session.setTutor(tutor);

        Session savedSession = sessionRepository.save(session);
        return mapToDTO(savedSession);
    }

    public SessionDTO updateSession(Long id, SessionDTO sessionDTO) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found with ID: " + id));

        session.setTitle(sessionDTO.getTitle());
        session.setDescription(sessionDTO.getDescription());
        session.setSessionLink(sessionDTO.getSessionLink());

        try {
            if (sessionDTO.getStartTime() != null)
                session.setStartTime(LocalDateTime.parse(sessionDTO.getStartTime()));
            if (sessionDTO.getEndTime() != null)
                session.setEndTime(LocalDateTime.parse(sessionDTO.getEndTime()));
        } catch (Exception e) {
            throw new RuntimeException("Date parsing error: " + e.getMessage());
        }

        if (sessionDTO.getBatchId() != null) {
            Batch batch = batchRepository.findById(sessionDTO.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found with ID: " + sessionDTO.getBatchId()));
            session.setBatch(batch);
        }

        if (sessionDTO.getTutorId() != null) {
            Tutor tutor = tutorRepository.findById(sessionDTO.getTutorId())
                    .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + sessionDTO.getTutorId()));
            session.setTutor(tutor);
        }

        Session updatedSession = sessionRepository.save(session);
        return mapToDTO(updatedSession);
    }

    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new RuntimeException("Session not found with ID: " + id);
        }
        sessionRepository.deleteById(id);
    }

    public List<SessionDTO> getSessionsByBatch(Long batchId) {
        return sessionRepository.findByBatchId(batchId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SessionDTO> getSessionsByTutor(Integer tutorId) {
        return sessionRepository.findByTutorId(tutorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SessionDTO> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SessionDTO mapToDTO(Session session) {
        return new SessionDTO(
                session.getId(),
                session.getTitle(),
                session.getDescription(),
                session.getSessionLink(),
                session.getStartTime(),
                session.getEndTime(),
                session.getBatch() != null ? session.getBatch().getId() : null,
                session.getBatch() != null ? session.getBatch().getName() : "Unknown Batch",
                session.getTutor() != null ? session.getTutor().getId() : null,
                session.getTutor() != null ? session.getTutor().getFirstName() + " " + session.getTutor().getLastName()
                        : "Unknown Tutor");
    }
}
