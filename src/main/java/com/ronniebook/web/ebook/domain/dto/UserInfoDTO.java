package com.ronniebook.web.ebook.domain.dto;

import java.time.Instant;

public class UserInfoDTO {

    private String imageUrl;

    private Instant createdDate;

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public UserInfoDTO(String imageUrl, Instant createdDate) {
        this.imageUrl = imageUrl;
        this.createdDate = createdDate;
    }
}
