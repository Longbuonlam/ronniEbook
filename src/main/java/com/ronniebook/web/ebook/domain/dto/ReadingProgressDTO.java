package com.ronniebook.web.ebook.domain.dto;

public class ReadingProgressDTO {

    private String id;

    private String title;

    private String author;

    private String imageUrl;

    private int totalChapter;

    private int finishedChapter;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getTotalChapter() {
        return totalChapter;
    }

    public void setTotalChapter(int totalChapter) {
        this.totalChapter = totalChapter;
    }

    public int getFinishedChapter() {
        return finishedChapter;
    }

    public void setFinishedChapter(int finishedChapter) {
        this.finishedChapter = finishedChapter;
    }

    public ReadingProgressDTO(String id, String title, String author, String imageUrl, int totalChapter, int finishedChapter) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.imageUrl = imageUrl;
        this.totalChapter = totalChapter;
        this.finishedChapter = finishedChapter;
    }
}
