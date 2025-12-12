package com.lms.auth.repository;

import com.lms.auth.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByBatch_Id(@Param("batchId") Long batchId);

    List<Folder> findByParent_Id(Long parentId);
}
