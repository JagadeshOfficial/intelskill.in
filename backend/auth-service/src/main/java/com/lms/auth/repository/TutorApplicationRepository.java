package com.lms.auth.repository;

import com.lms.auth.entity.TutorApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TutorApplicationRepository extends JpaRepository<TutorApplication, Long> {
    List<TutorApplication> findByStatus(TutorApplication.ApplicationStatus status);
}
