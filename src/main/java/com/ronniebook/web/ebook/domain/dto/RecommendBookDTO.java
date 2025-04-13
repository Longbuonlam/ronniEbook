package com.ronniebook.web.ebook.domain.dto;

public class RecommendBookDTO {

    private String book_id;
    private double predicted_rating;

    public String getBook_id() {
        return book_id;
    }

    public void setBook_id(String book_id) {
        this.book_id = book_id;
    }

    public double getPredicted_rating() {
        return predicted_rating;
    }

    public void setPredicted_rating(double predicted_rating) {
        this.predicted_rating = predicted_rating;
    }
}
