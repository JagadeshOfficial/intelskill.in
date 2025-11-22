package com.lms.auth.service;

import com.lms.auth.entity.Tutor;
import com.lms.auth.repository.TutorRepository;
import com.lms.auth.dto.TutorRegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TutorService {

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private FileStorageService fileStorageService;

    public Tutor registerTutor(TutorRegisterRequest request) throws Exception {
        // ...existing validation code...
        Tutor tutor = new Tutor();
        tutor.setEmail(request.getEmail());
        tutor.setPassword(passwordEncoder.encode(request.getPassword()));
        tutor.setFirstName(request.getFirstName());
        tutor.setLastName(request.getLastName());
        tutor.setPhoneNumber(request.getPhoneNumber());
        tutor.setExpertise(request.getExpertise());
        tutor.setBio(request.getBio());
        tutor.setQualification(request.getQualification());
        tutor.setExperience(request.getExperience());
        tutor.setHourlyRate(request.getHourlyRate());
        tutor.setVerified(true); // Email verified via OTP
        tutor.setStatus("PENDING"); // Waiting for admin approval
        tutor.setCreatedAt(LocalDateTime.now());
        tutor.setUpdatedAt(LocalDateTime.now());

        Tutor savedTutor = tutorRepository.save(tutor);
        notificationService.createTutorRegisterNotification(savedTutor);
        return savedTutor;
    }

    public Optional<Tutor> findByEmail(String email) {
        return tutorRepository.findByEmail(email);
    }

    public Tutor updateLastLogin(Integer tutorId) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            tutor.setLastLogin(LocalDateTime.now());
            tutor.setUpdatedAt(LocalDateTime.now());
            return tutorRepository.save(tutor);
        }
        return null;
    }

    public String generateToken(Tutor tutor) {
        return jwtTokenProvider.generateAdminToken(tutor.getId(), tutor.getEmail(), "TUTOR");
    }

    // New: retrieve all tutors
    public java.util.List<Tutor> getAllTutors() {
        return tutorRepository.findAll();
    }

    // New: get tutor by id
    public Optional<Tutor> getTutorById(Integer id) {
        return tutorRepository.findById(id);
    }

    // Update tutor status (e.g., APPROVED, REJECTED, SUSPENDED)
    public Tutor updateTutorStatus(Integer tutorId, String status) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            tutor.setStatus(status);
            tutor.setUpdatedAt(LocalDateTime.now());
            return tutorRepository.save(tutor);
        }
        throw new IllegalArgumentException("Tutor not found with id: " + tutorId);
    }

    // Update tutor profile fields
    public java.util.Optional<Tutor> updateTutorProfile(Integer tutorId, java.util.Map<String, String> updates) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            if (updates.containsKey("firstName")) tutor.setFirstName(updates.get("firstName"));
            if (updates.containsKey("lastName")) tutor.setLastName(updates.get("lastName"));
            if (updates.containsKey("phoneNumber")) tutor.setPhoneNumber(updates.get("phoneNumber"));
            if (updates.containsKey("expertise")) tutor.setExpertise(updates.get("expertise"));
            if (updates.containsKey("bio")) tutor.setBio(updates.get("bio"));
            if (updates.containsKey("qualification")) tutor.setQualification(updates.get("qualification"));
            if (updates.containsKey("experience")) tutor.setExperience(updates.get("experience"));
            if (updates.containsKey("hourlyRate")) tutor.setHourlyRate(updates.get("hourlyRate"));
            if (updates.containsKey("photoUrl")) tutor.setPhotoUrl(updates.get("photoUrl"));
            tutor.setUpdatedAt(LocalDateTime.now());
            Tutor saved = tutorRepository.save(tutor);
            return java.util.Optional.of(saved);
        }
        return java.util.Optional.empty();
    }

    public Tutor updateTutorPhotoUrl(Integer tutorId, String photoUrl) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            tutor.setPhotoUrl(photoUrl);
            tutor.setUpdatedAt(LocalDateTime.now());
            return tutorRepository.save(tutor);
        }
        throw new IllegalArgumentException("Tutor not found with id: " + tutorId);
    }

    /**
     * Delete a tutor and its uploaded photo file (if present)
     */
    public void deleteTutor(Integer tutorId) throws Exception {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            String photo = tutor.getPhotoUrl();
            if (photo != null && !photo.isEmpty()) {
                try {
                    fileStorageService.deleteFile(photo);
                } catch (Exception e) {
                    // Log and continue; deletion of file should not prevent tutor deletion
                }
            }
            tutorRepository.deleteById(tutorId);
            return;
        }
        throw new IllegalArgumentException("Tutor not found with id: " + tutorId);
    }
}
