package com.lms.auth.repository;

import com.lms.auth.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByBatchId(Long batchId);

    List<Session> findByTutorId(Integer tutorId);
}
