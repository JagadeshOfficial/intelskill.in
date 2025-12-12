package com.lms.auth.controller;

import com.lms.auth.entity.Folder;
import com.lms.auth.entity.Batch;
import com.lms.auth.repository.FolderRepository;
import com.lms.auth.repository.BatchRepository;
import com.lms.auth.entity.TutorContent;
import com.lms.auth.repository.TutorContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/batches")
public class FolderController {
    @Autowired
    private FolderRepository folderRepository;
    @Autowired
    private BatchRepository batchRepository;
    @Autowired
    private TutorContentRepository tutorContentRepository;

    @PostMapping("/{batchId}/folders")
    public Folder createFolder(@PathVariable Long batchId, @RequestBody Map<String, Object> body) {
        Batch batch = batchRepository.findById(batchId).orElseThrow();
        Folder folder = new Folder();
        folder.setBatch(batch);
        folder.setName((String) body.get("name"));

        if (body.containsKey("parentId") && body.get("parentId") != null) {
            try {
                Long parentId = Long.parseLong(body.get("parentId").toString());
                Folder parent = folderRepository.findById(parentId).orElse(null);
                folder.setParent(parent);
            } catch (NumberFormatException e) {
                // Ignore invalid parentId
            }
        }
        return folderRepository.save(folder);
    }

    @GetMapping("/{batchId}/folders")
    public List<Folder> getFolders(@PathVariable Long batchId) {
        return folderRepository.findByBatch_Id(batchId);
    }

    @GetMapping("/folders/{folderId}/files")
    public List<TutorContent> getFiles(@PathVariable Long folderId) {
        return tutorContentRepository.findByFolderId(folderId);
    }

    // Delete a folder by its ID
    @Transactional
    @DeleteMapping("/folders/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long folderId) {
        try {
            deleteFolderRecursively(folderId);
            return ResponseEntity.ok().body(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private void deleteFolderRecursively(Long folderId) {
        List<Folder> children = folderRepository.findByParent_Id(folderId);
        for (Folder child : children) {
            deleteFolderRecursively(child.getId());
        }
        folderRepository.deleteById(folderId);
    }

    // Update a folder's name by its ID
    @Transactional
    @PutMapping("/folders/{folderId}")
    public ResponseEntity<?> updateFolder(@PathVariable Long folderId, @RequestBody Map<String, String> body) {
        try {
            Folder folder = folderRepository.findById(folderId).orElseThrow();
            folder.setName(body.get("name"));
            folderRepository.save(folder);
            return ResponseEntity.ok().body(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
