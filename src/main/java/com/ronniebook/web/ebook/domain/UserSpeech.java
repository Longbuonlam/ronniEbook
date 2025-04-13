package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_speech")
public class UserSpeech extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String fileName;

    private String userId;

    private String bookId;

    private String storageId;

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public String getStorageId() {
        return storageId;
    }

    public void setStorageId(String storageId) {
        this.storageId = storageId;
    }

    public UserSpeech(String fileName, String userId, String bookId) {
        this.fileName = fileName;
        this.userId = userId;
        this.bookId = bookId;
    }
}
