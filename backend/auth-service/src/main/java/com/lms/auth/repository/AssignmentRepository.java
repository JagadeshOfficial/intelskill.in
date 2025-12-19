package com.lms.auth.repository;

import com.lms.auth.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCreatorId(String creatorId);

    List<Assignment> findByCourseIn(List<String> courseNames);
}
