package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.History;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.ebook.repository.HistoryRepository;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class HistoryService {

    private final Logger log = LoggerFactory.getLogger(HistoryService.class);
    private final HistoryRepository historyRepository;
    private final BookRepository bookRepository;

    public HistoryService(HistoryRepository historyRepository, BookRepository bookRepository) {
        this.historyRepository = historyRepository;
        this.bookRepository = bookRepository;
    }

    public Page<Book> findAll(Pageable pageable, String searchText) {
        log.debug("Request to get all Favourite Books");
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        List<History> historyList = historyRepository.findByUserId(userId);
        List<String> listBookIds = new ArrayList<>();
        for (History history : historyList) {
            listBookIds.add(history.getBookId());
        }

        Page<Book> bookPage;
        // Add SortPage
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "book_name");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }
        if (searchText == null) {
            bookPage = bookRepository.findAllWithBookIds(pageable, listBookIds);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            bookPage = bookRepository.findByTextWithBookIds(pageable, searchText, listBookIds);
        }
        return bookPage;
    }

    public void delete(String id) {
        log.debug("request to delete read-book, id: {}", id);
        History history = historyRepository.findById(id).orElseThrow();
        historyRepository.delete(history);
    }
}
