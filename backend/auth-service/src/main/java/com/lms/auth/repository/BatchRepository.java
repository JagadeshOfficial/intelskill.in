package com.lms.auth.repository;

import com.lms.auth.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    java.util.List<Batch> findByCourseId(Long courseId);
}
