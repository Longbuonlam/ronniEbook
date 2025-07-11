package com.ronniebook.web.ebook.domain;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Chapter.
 */
@Document(collection = "chapter")
public class Chapter extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @Field("chapter_number")
    private Integer number;

    @NotNull
    private String chapterName;

    private LanguageCode language;

    private ChapterStatus chapterStatus;

    private String bookId;

    private String storageId;

    @JsonIgnore
    private boolean isDeleted;

    public Chapter() {}

    public Chapter language(LanguageCode language) {
        this.setLanguage(language);
        return this;
    }

    public LanguageCode getLanguage() {
        return language;
    }

    public void setLanguage(LanguageCode language) {
        this.language = language;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public String getChapterName() {
        return chapterName;
    }

    public void setChapterName(String chapterName) {
        this.chapterName = chapterName;
    }

    public ChapterStatus getChapterStatus() {
        return chapterStatus;
    }

    public void setChapterStatus(ChapterStatus chapterStatus) {
        this.chapterStatus = chapterStatus;
    }

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
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

    public Chapter id(String id) {
        this.setId(id);
        return this;
    }

    public Chapter chapterName(String chapterName) {
        this.setChapterName(chapterName);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Chapter)) {
            return false;
        }
        return getId() != null && getId().equals(((Chapter) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "Chapter{" +
            "number=" +
            number +
            ", chapterName='" +
            chapterName +
            '\'' +
            ", chapterStatus=" +
            chapterStatus +
            ", bookId='" +
            bookId +
            '\'' +
            '}'
        );
    }
}
