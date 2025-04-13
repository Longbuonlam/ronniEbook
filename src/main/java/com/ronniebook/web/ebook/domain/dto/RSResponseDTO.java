package com.ronniebook.web.ebook.domain.dto;

import java.util.List;

public class RSResponseDTO {

    private String user_id;
    private List<RecommendBookDTO> recommendations;

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public List<RecommendBookDTO> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendBookDTO> recommendations) {
        this.recommendations = recommendations;
    }
}
