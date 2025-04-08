package com.ronniebook.web.ebook.domain.dto;

import java.util.List;

public class SimilarBookDTO {

    private String book_id;
    private List<String> recommendations;

    public String getBook_id() {
        return book_id;
    }

    public void setBook_id(String book_id) {
        this.book_id = book_id;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}
