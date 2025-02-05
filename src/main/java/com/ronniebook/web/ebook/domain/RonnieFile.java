package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "file")
public class RonnieFile extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String fileName;

    private String fileUrl;

    private FileStore fileStore;

    private FileStatus fileStatus;

    private String storageId;

    public FileStatus getFileStatus() {
        return fileStatus;
    }

    public void setFileStatus(FileStatus fileStatus) {
        this.fileStatus = fileStatus;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public FileStore getFileStore() {
        return fileStore;
    }

    public void setFileStore(FileStore fileStore) {
        this.fileStore = fileStore;
    }

    public String getStorageId() {
        return storageId;
    }

    public void setStorageId(String storageId) {
        this.storageId = storageId;
    }

    public RonnieFile(String fileName, String fileUrl, FileStore fileStore, FileStatus fileStatus, String storageId) {
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileStore = fileStore;
        this.fileStatus = fileStatus;
        this.storageId = storageId;
    }
}
