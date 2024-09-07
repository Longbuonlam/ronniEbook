package com.ronniebook.web.ebook.domain;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
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

    private Instant createDate;

    private String createBy;

    private ChapterStatus chapterStatus;

    private List<DocumentFile> documentFiles;

    private String bookId;

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

    public Instant getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Instant createDate) {
        this.createDate = createDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public ChapterStatus getChapterStatus() {
        return chapterStatus;
    }

    public void setChapterStatus(ChapterStatus chapterStatus) {
        this.chapterStatus = chapterStatus;
    }

    public List<DocumentFile> getDocumentFiles() {
        return documentFiles;
    }

    public void setDocumentFiles(List<DocumentFile> documentFiles) {
        this.documentFiles = documentFiles;
    }

    public void addDocumentFile(DocumentFile docFile) {
        if (documentFiles == null) {
            documentFiles = new ArrayList<DocumentFile>();
        }
        documentFiles.add(docFile);
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
            ", createDate=" +
            createDate +
            ", createBy='" +
            createBy +
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
