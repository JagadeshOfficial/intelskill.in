package com.lms.auth.repository;

import com.lms.auth.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);

    void deleteByTutorId(Integer tutorId);
}
