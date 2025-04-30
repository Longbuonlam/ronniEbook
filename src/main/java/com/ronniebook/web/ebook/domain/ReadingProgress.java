package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import java.util.Set;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reading_progress")
public class ReadingProgress extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;

    private String bookId;

    private Set<String> finishedChapterStorageIds;

    public ReadingProgress() {}

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Set<String> getFinishedChapterStorageIds() {
        return finishedChapterStorageIds;
    }

    public void setFinishedChapterStorageIds(Set<String> finishedChapterStorageIds) {
        this.finishedChapterStorageIds = finishedChapterStorageIds;
    }
}
