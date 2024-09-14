package com.ronniebook.web.ebook.domain;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "book_view")
public class BookView extends BaseEntity {

    private String bookId;

    private int viewCount;

    public BookView() {}

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public int getViewCount() {
        return viewCount;
    }

    public void setViewCount(int viewCount) {
        this.viewCount = viewCount;
    }
}
