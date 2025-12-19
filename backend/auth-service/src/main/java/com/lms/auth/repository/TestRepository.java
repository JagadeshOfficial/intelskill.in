package com.lms.auth.repository;

import com.lms.auth.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByCreatorId(String creatorId);

    List<Test> findByCourseIn(List<String> courseNames);
}
