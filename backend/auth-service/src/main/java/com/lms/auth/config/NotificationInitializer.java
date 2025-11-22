package com.lms.auth.config;

import com.lms.auth.entity.Tutor;
import com.lms.auth.entity.Notification;
import com.lms.auth.repository.TutorRepository;
import com.lms.auth.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class NotificationInitializer implements CommandLineRunner {
    @Autowired
    private TutorRepository tutorRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        List<Tutor> pendingTutors = tutorRepository.findAll().stream()
            .filter(t -> "PENDING".equalsIgnoreCase(t.getStatus()))
            .toList();
        for (Tutor tutor : pendingTutors) {
            boolean exists = notificationRepository.findByTypeOrderByCreatedAtDesc("TUTOR_REGISTER")
                .stream().anyMatch(n -> n.getTutorId() != null && n.getTutorId().equals(tutor.getId()));
            if (!exists) {
                Notification n = new Notification();
                n.setType("TUTOR_REGISTER");
                n.setMessage("New tutor registration: " + tutor.getFirstName() + " " + tutor.getLastName());
                n.setTutorId(tutor.getId());
                notificationRepository.save(n);
            }
        }
    }
}
