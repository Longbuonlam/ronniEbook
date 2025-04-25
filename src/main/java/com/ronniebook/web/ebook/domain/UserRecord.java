package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_record")
public class UserRecord extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;

    private String recordUrl;

    private String path;

    private String originalName;

    private long size;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRecordUrl() {
        return recordUrl;
    }

    public void setRecordUrl(String recordUrl) {
        this.recordUrl = recordUrl;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public UserRecord(String userId, String recordUrl, String path, String originalName, long size) {
        this.userId = userId;
        this.recordUrl = recordUrl;
        this.path = path;
        this.originalName = originalName;
        this.size = size;
    }
}
