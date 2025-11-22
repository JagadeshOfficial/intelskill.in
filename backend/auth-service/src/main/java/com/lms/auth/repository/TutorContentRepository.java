package com.lms.auth.repository;

import com.lms.auth.entity.TutorContent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TutorContentRepository extends JpaRepository<TutorContent, Integer> {
    List<TutorContent> findByTutorId(Integer tutorId);
}
