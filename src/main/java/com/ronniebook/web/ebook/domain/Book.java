package com.ronniebook.web.ebook.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Book.
 */
@Document(collection = "book")
public class Book extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @Field("book_name")
    private String bookName;

    @NotNull
    private String title;

    @NotNull
    private String author;

    private String description;

    @NotNull
    private String category;

    private Integer chapterCount = 0;

    @NotNull
    private LanguageCode language;

    private BookStatus bookStatus;

    private BookSetting bookSetting;

    @Size(max = 2048)
    @Field("image_url")
    private String imageUrl;

    private String storageId;

    @JsonIgnore
    private boolean isDeleted;

    public Book(
        String bookName,
        String title,
        String author,
        String description,
        String category,
        LanguageCode language,
        BookStatus bookStatus
    ) {
        this.bookName = bookName;
        this.title = title;
        this.author = author;
        this.description = description;
        this.category = category;
        this.language = language;
        this.bookStatus = bookStatus;
    }

    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getChapterCount() {
        return chapterCount;
    }

    public void setChapterCount(Integer chapterCount) {
        this.chapterCount = chapterCount;
    }

    public LanguageCode getLanguage() {
        return language;
    }

    public void setLanguage(LanguageCode language) {
        this.language = language;
    }

    public BookStatus getBookStatus() {
        return bookStatus;
    }

    public void setBookStatus(BookStatus bookStatus) {
        this.bookStatus = bookStatus;
    }

    public BookSetting getBookSetting() {
        return bookSetting;
    }

    public void setBookSetting(BookSetting bookSetting) {
        this.bookSetting = bookSetting;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public String getStorageId() {
        return storageId;
    }

    public void setStorageId(String storageId) {
        this.storageId = storageId;
    }

    public Book id(String id) {
        this.setId(id);
        return this;
    }

    public Book bookName(String bookName) {
        this.setBookName(bookName);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Book)) {
            return false;
        }
        return getId() != null && getId().equals(((Book) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "Book{" +
            "bookName='" +
            bookName +
            '\'' +
            ", title='" +
            title +
            '\'' +
            ", author='" +
            author +
            '\'' +
            ", description='" +
            description +
            '\'' +
            ", category='" +
            category +
            '\'' +
            ", chapterCount=" +
            chapterCount +
            ", language=" +
            language +
            '}'
        );
    }
}
