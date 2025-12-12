package com.lms.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "folders")
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Folder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Folder> children = new java.util.ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JsonIgnore
    public Batch getBatch() {
        return batch;
    }

    public Long getBatchId() {
        return batch != null ? batch.getId() : null;
    }

    public void setBatch(Batch batch) {
        this.batch = batch;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonIgnore
    public Folder getParent() {
        return parent;
    }

    public Long getParentId() {
        return parent != null ? parent.getId() : null;
    }

    public void setParent(Folder parent) {
        this.parent = parent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
