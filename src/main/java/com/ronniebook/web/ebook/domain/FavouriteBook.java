package com.ronniebook.web.ebook.domain;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "favourite_book")
public class FavouriteBook extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private String bookId;

    private Instant addDate;

    @NotNull
    @Field("book_name")
    private String bookName;

    private String author;

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

    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }
}
