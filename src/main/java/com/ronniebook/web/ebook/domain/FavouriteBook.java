package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "favourite_book")
public class FavouriteBook extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;

    private String bookId;

    @JsonIgnore
    private boolean isDeleted;

    public FavouriteBook() {}

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

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }
}
