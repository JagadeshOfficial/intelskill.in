package com.lms.chat.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderId;

    private String recipientId;

    @Column(length = 2000)
    private String content;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    public enum MessageStatus {
        SENT, DELIVERED, READ
    }

    public ChatMessage() {
    }

    public ChatMessage(Long id, String senderId, String recipientId, String content, LocalDateTime timestamp,
            MessageStatus status) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.content = content;
        this.timestamp = timestamp;
        this.status = status;
    }

    @PrePersist
    public void prePersist() {
        if (timestamp == null)
            timestamp = LocalDateTime.now();
        if (status == null)
            status = MessageStatus.SENT;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public MessageStatus getStatus() {
        return status;
    }

    public void setStatus(MessageStatus status) {
        this.status = status;
    }
}
