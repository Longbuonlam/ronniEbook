package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "voice")
public class Voice extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String bookVoiceName;

    private String bookId;

    private String storageId;

    public String getBookVoiceName() {
        return bookVoiceName;
    }

    public void setBookVoiceName(String bookVoiceName) {
        this.bookVoiceName = bookVoiceName;
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

    public Voice(String bookVoiceName, String bookId, String storageId) {
        this.bookVoiceName = bookVoiceName;
        this.bookId = bookId;
        this.storageId = storageId;
    }
}
