package com.ronniebook.web.ebook.domain.dto;

import com.ronniebook.web.ebook.domain.FileStatus;
import com.ronniebook.web.ebook.domain.FileStore;

public class RonnieFileDTO {

    private String id;

    private String fileName;

    private String fileUrl;

    private FileStore fileStore;

    private FileStatus fileStatus;

    private String storageId;

    private String chapterStorageId;

    public RonnieFileDTO(
        String id,
        String fileName,
        String fileUrl,
        FileStore fileStore,
        FileStatus fileStatus,
        String storageId,
        String chapterStorageId
    ) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileStore = fileStore;
        this.fileStatus = fileStatus;
        this.storageId = storageId;
        this.chapterStorageId = chapterStorageId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public FileStore getFileStore() {
        return fileStore;
    }

    public void setFileStore(FileStore fileStore) {
        this.fileStore = fileStore;
    }

    public FileStatus getFileStatus() {
        return fileStatus;
    }

    public void setFileStatus(FileStatus fileStatus) {
        this.fileStatus = fileStatus;
    }

    public String getStorageId() {
        return storageId;
    }

    public void setStorageId(String storageId) {
        this.storageId = storageId;
    }

    public String getChapterStorageId() {
        return chapterStorageId;
    }

    public void setChapterStorageId(String chapterStorageId) {
        this.chapterStorageId = chapterStorageId;
    }
}
