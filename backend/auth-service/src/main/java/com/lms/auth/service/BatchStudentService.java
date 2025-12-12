package com.lms.auth.service;

import com.lms.auth.entity.Batch;
import com.lms.auth.entity.Student;
import com.lms.auth.repository.BatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;

@Service
public class BatchStudentService {
    @Autowired
    private BatchRepository batchRepository;

    @Transactional(readOnly = true)
    public List<Student> getStudentsByBatchId(Long batchId) {
        return batchRepository.findById(batchId)
                .map(batch -> {
                    // Force initialization
                    batch.getStudents().size();
                    return batch.getStudents();
                })
                .orElse(Collections.emptyList());
    }
}
