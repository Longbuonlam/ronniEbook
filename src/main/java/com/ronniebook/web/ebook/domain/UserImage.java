package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_image")
public class UserImage extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;

    private String imageUrl;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public UserImage(String userId, String imageUrl) {
        this.userId = userId;
        this.imageUrl = imageUrl;
    }
}
