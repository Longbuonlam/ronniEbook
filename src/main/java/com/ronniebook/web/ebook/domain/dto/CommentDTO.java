package com.ronniebook.web.ebook.domain.dto;

public class CommentDTO {

    private String id;

    private String userId;

    private String bookId;

    private String description;

    private int rating;

    public CommentDTO(String id, String userId, String bookId, String description, int rating) {
        this.id = id;
        this.userId = userId;
        this.bookId = bookId;
        this.description = description;
        this.rating = rating;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }
}
