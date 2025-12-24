package com.lms.auth.dto;

import java.time.LocalDateTime;

public class SessionDTO {
    private Long id;
    private String title;
    private String description;
    private String sessionLink;
    private String startTime; // Changed to String for easy transport
    private String endTime; // Changed to String for easy transport
    private Long batchId;
    private String batchName;
    private Integer tutorId;
    private String tutorName;

    // Constructors
    public SessionDTO() {
    }

    public SessionDTO(Long id, String title, String description, String sessionLink, String startTime, String endTime,
            Long batchId, String batchName, Integer tutorId, String tutorName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.sessionLink = sessionLink;
        this.startTime = startTime;
        this.endTime = endTime;
        this.batchId = batchId;
        this.batchName = batchName;
        this.tutorId = tutorId;
        this.tutorName = tutorName;
    }

    // Convenience constructor for Service mapping
    public SessionDTO(Long id, String title, String description, String sessionLink, LocalDateTime startTime,
            LocalDateTime endTime, Long batchId, String batchName, Integer tutorId, String tutorName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.sessionLink = sessionLink;
        this.startTime = startTime != null ? startTime.toString() : null;
        this.endTime = endTime != null ? endTime.toString() : null;
        this.batchId = batchId;
        this.batchName = batchName;
        this.tutorId = tutorId;
        this.tutorName = tutorName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSessionLink() {
        return sessionLink;
    }

    public void setSessionLink(String sessionLink) {
        this.sessionLink = sessionLink;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public Integer getTutorId() {
        return tutorId;
    }

    public void setTutorId(Integer tutorId) {
        this.tutorId = tutorId;
    }

    public String getTutorName() {
        return tutorName;
    }

    public void setTutorName(String tutorName) {
        this.tutorName = tutorName;
    }
}
