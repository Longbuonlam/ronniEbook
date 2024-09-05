package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "favourite_book")
public class FavouriteBook extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String bookId;

    private Instant addDate;

    public FavouriteBook() {}

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public Instant getAddDate() {
        return addDate;
    }

    public void setAddDate(Instant addDate) {
        this.addDate = addDate;
    }
}
