package com.lms.auth.repository;

import com.lms.auth.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByCourseId(Long courseId);

    // Explicit query to ensure correct join fetching for students in batch
    @Query("SELECT b FROM Batch b JOIN b.students s WHERE s.id = :studentId")
    List<Batch> findBatchesForStudent(@Param("studentId") Integer studentId);
}
