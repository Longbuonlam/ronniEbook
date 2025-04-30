package com.ronniebook.web.ebook.service;

import com.ronniebook.web.domain.User;
import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.Rating;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DataConverter {

    public static Map<String, Object> toSyncBook(Book book) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", book.getId());
        map.put("title", book.getTitle());
        map.put("author", book.getAuthor());
        map.put("genre", book.getCategory());
        map.put("description", book.getDescription());
        return map;
    }

    public static Map<String, Object> toSyncUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getLogin());
        return map;
    }

    public static Map<String, Object> toSyncRating(Rating rating) {
        Map<String, Object> map = new HashMap<>();
        map.put("user_id", rating.getUserId());
        map.put("book_id", rating.getBookId());
        map.put("rating", rating.getBookRating());
        return map;
    }

    public static List<Map<String, Object>> convertBooks(List<Book> books) {
        return books.stream().map(DataConverter::toSyncBook).collect(Collectors.toList());
    }

    public static List<Map<String, Object>> convertUsers(List<User> users) {
        return users.stream().map(DataConverter::toSyncUser).collect(Collectors.toList());
    }

    public static List<Map<String, Object>> convertRatings(List<Rating> ratings) {
        return ratings.stream().map(DataConverter::toSyncRating).collect(Collectors.toList());
    }
}
