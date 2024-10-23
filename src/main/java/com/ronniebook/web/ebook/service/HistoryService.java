package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.History;
import com.ronniebook.web.ebook.repository.HistoryRepository;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
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

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public Page<History> findAll(Pageable pageable, String searchText) {
        Page<History> page;
        // Add SortPage
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "bookName");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }
        if (searchText == null) {
            page = historyRepository.findAll(pageable);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            page = historyRepository.findByText(pageable, searchText);
        }
        return page;
    }

    public void delete(String id) {
        log.debug("request to delete read-book, id: {}", id);
        History history = historyRepository.findById(id).orElseThrow();
        historyRepository.delete(history);
    }
}
