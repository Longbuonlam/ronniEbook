package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("rating")
public class Rating extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;

    private String bookId;

    private int bookRating;

    public Rating(String userId, String bookId, int bookRating) {
        this.userId = userId;
        this.bookId = bookId;
        this.bookRating = bookRating;
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

    public int getBookRating() {
        return bookRating;
    }

    public void setBookRating(int bookRating) {
        this.bookRating = bookRating;
    }
}
