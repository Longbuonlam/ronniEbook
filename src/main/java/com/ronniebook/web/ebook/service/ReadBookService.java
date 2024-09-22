package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.ReadBook;
import com.ronniebook.web.ebook.repository.ReadBookRepository;
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
public class ReadBookService {

    private final Logger log = LoggerFactory.getLogger(ReadBookService.class);
    private final ReadBookRepository readBookRepository;

    public ReadBookService(ReadBookRepository readBookRepository) {
        this.readBookRepository = readBookRepository;
    }

    public Page<ReadBook> findAll(Pageable pageable, String searchText) {
        Page<ReadBook> page;
        // Add SortPage
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "bookName");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }
        if (searchText == null) {
            page = readBookRepository.findAll(pageable);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            page = readBookRepository.findByText(pageable, searchText);
        }
        return page;
    }

    public void delete(String id) {
        log.debug("request to delete read-book, id: {}", id);
        ReadBook readBook = readBookRepository.findById(id).orElseThrow();
        readBookRepository.delete(readBook);
    }
}
