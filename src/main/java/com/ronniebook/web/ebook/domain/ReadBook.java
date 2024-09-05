package com.ronniebook.web.ebook.domain;

import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "read_book")
public class ReadBook extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String bookId;

    private Instant date;

    private boolean isFinished;

    public ReadBook() {}

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public boolean isFinished() {
        return isFinished;
    }

    public void setFinished(boolean finished) {
        isFinished = finished;
    }
}
