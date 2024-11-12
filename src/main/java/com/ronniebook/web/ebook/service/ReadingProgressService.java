package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.ReadingProgress;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.ebook.repository.ReadingProgressRepository;
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
public class ReadingProgressService {

    private final Logger log = LoggerFactory.getLogger(ReadingProgressService.class);
    private final ReadingProgressRepository readingProgressRepository;
    private final BookRepository bookRepository;

    public ReadingProgressService(ReadingProgressRepository readingProgressRepository, BookRepository bookRepository) {
        this.readingProgressRepository = readingProgressRepository;
        this.bookRepository = bookRepository;
    }

    public ReadingProgress save(ReadingProgress readingProgress) {
        log.debug("Request to save reading progress : {}", readingProgress);
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        readingProgress.setUserId(userId);
        return readingProgressRepository.save(readingProgress);
    }

    public Page<Book> findAllReadingProgressByUserId(Pageable pageable, String searchText) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        List<ReadingProgress> readingProgressList = readingProgressRepository.findByUserId(userId);
        List<String> listBookIds = new ArrayList<>();
        for (ReadingProgress readingProgress : readingProgressList) {
            listBookIds.add(readingProgress.getBookId());
        }

        Page<Book> bookPage;
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
}
