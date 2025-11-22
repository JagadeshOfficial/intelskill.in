package com.lms.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.lms.auth.entity.TutorContent;
import com.lms.auth.repository.TutorContentRepository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ContentService {
    @Autowired
    private TutorContentRepository tutorContentRepository;

    // Added logging and validation for metadata saving
    public void saveContent(String title, String description, String driveFileId, Integer tutorId) {
        if (title == null || title.isEmpty() || driveFileId == null || driveFileId.isEmpty()) {
            throw new IllegalArgumentException("Invalid input data: title and driveFileId are required");
        }

        TutorContent content = new TutorContent();
        content.setTitle(title);
        content.setDescription(description);
        content.setDriveFileId(driveFileId);
        content.setTutorId(tutorId);

        tutorContentRepository.save(content);
        System.out.println("Content saved successfully: " + content);
    }

    // Added method to upload file to Google Drive
    public String uploadFileToDrive(MultipartFile file) throws IOException {
        // Simulate Google Drive upload logic
        String driveFileId = "mockDriveFileId"; // Replace with actual upload logic
        System.out.println("File uploaded to Google Drive with ID: " + driveFileId);
        return driveFileId;
    }
}
