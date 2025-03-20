package com.ronniebook.web.ebook.domain.dto;

import com.ronniebook.web.ebook.domain.LanguageCode;

public class ChapterInfoDTO {

    private String chapterName;

    private Integer chapterNumber;

    private String bookName;

    private LanguageCode language;

    public String getChapterName() {
        return chapterName;
    }

    public void setChapterName(String chapterName) {
        this.chapterName = chapterName;
    }

    public Integer getChapterNumber() {
        return chapterNumber;
    }

    public void setChapterNumber(Integer chapterNumber) {
        this.chapterNumber = chapterNumber;
    }

    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    public LanguageCode getLanguage() {
        return language;
    }

    public ChapterInfoDTO(String chapterName, Integer chapterNumber, String bookName, LanguageCode language) {
        this.chapterName = chapterName;
        this.chapterNumber = chapterNumber;
        this.bookName = bookName;
        this.language = language;
    }
}
