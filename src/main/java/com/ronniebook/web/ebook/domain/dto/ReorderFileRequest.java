package com.ronniebook.web.ebook.domain.dto;

import java.util.Map;

public class ReorderFileRequest {

    private String chapterStorageId;

    private Map<String, Integer> newOrder;

    public String getChapterStorageId() {
        return chapterStorageId;
    }

    public Map<String, Integer> getNewOrder() {
        return newOrder;
    }
}
