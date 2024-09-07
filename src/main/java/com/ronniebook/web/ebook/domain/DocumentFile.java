package com.ronniebook.web.ebook.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;

public class DocumentFile {

    @JsonIgnore
    private String filePath;

    private ChapterStatus fileType;

    private Instant createdDate;

    private String createdBy;

    private Integer fileVersion;

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public ChapterStatus getFileType() {
        return fileType;
    }

    public void setFileType(ChapterStatus fileType) {
        this.fileType = fileType;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Integer getFileVersion() {
        return fileVersion;
    }

    public void setFileVersion(Integer fileVersion) {
        this.fileVersion = fileVersion;
    }

    public DocumentFile fileVersion(int fileVersion) {
        this.fileVersion = fileVersion;
        return this;
    }

    private String extractFileNameFromPath(String filePath) {
        Path path = Paths.get(filePath);
        return path.getFileName().toString();
    }

    @JsonIgnore
    public String getFileName() {
        return extractFileNameFromPath(filePath);
    }

    public DocumentFile fileType(ChapterStatus fileType) {
        this.fileType = fileType;
        return this;
    }

    public DocumentFile createdDate(Instant createdDate) {
        this.createdDate = createdDate;
        return this;
    }

    public DocumentFile createdBy(String createdBy) {
        this.createdBy = createdBy;
        return this;
    }
}
