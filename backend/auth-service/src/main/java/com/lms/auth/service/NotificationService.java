package com.lms.auth.service;

import com.lms.auth.entity.Notification;
import com.lms.auth.entity.Tutor;
import com.lms.auth.repository.NotificationRepository;
import com.lms.auth.repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private TutorRepository tutorRepository;
    @Autowired
    private EmailService emailService;

    public List<Notification> getRecentNotifications() {
        return notificationRepository.findByTypeOrderByCreatedAtDesc("TUTOR_REGISTER");
    }

    public Notification createTutorRegisterNotification(Tutor tutor) {
        Notification n = new Notification();
        n.setType("TUTOR_REGISTER");
        n.setMessage("New tutor registration: " + tutor.getFirstName() + " " + tutor.getLastName());
        n.setTutorId(tutor.getId());
        return notificationRepository.save(n);
    }

    public Notification handleTutorAction(Integer notificationId, String action) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        Tutor tutor = tutorRepository.findById(n.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        if ("ACCEPT".equalsIgnoreCase(action)) {
            tutor.setStatus("APPROVED");
            tutorRepository.save(tutor);
            n.setStatus("ACCEPTED");
            try {
                String subject = "Your Tutor Application is Approved";
                String body = String.format(
                        "Hello %s,\n\nYour tutor application has been approved. You can now log in and complete your profile.\n\nRegards,\nLMS Team",
                        tutor.getFirstName() != null ? tutor.getFirstName() : "");
                emailService.sendSimpleEmail(tutor.getEmail(), subject, body);
            } catch (Exception e) {
                // Log and continue
                logger.error("Failed to send approval email: {}", e.getMessage(), e);
            }
        } else if ("REJECT".equalsIgnoreCase(action)) {
            tutor.setStatus("REJECTED");
            tutorRepository.save(tutor);
            n.setStatus("REJECTED");
            try {
                String subject = "Your Tutor Application Status";
                String body = String.format(
                        "Hello %s,\n\nWe are sorry to inform you that your tutor application was rejected. For more information, please contact support.\n\nRegards,\nLMS Team",
                        tutor.getFirstName() != null ? tutor.getFirstName() : "");
                emailService.sendSimpleEmail(tutor.getEmail(), subject, body);
            } catch (Exception e) {
                logger.error("Failed to send rejection email: {}", e.getMessage(), e);
            }
        }
        n.setIsRead(true);
        return notificationRepository.save(n);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteNotificationsForTutor(Integer tutorId) {
        notificationRepository.deleteByTutorId(tutorId);
    }
}
