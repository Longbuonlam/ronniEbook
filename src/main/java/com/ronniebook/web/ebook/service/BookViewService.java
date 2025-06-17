package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.BookView;
import com.ronniebook.web.ebook.repository.BookViewRepository;
import com.ronniebook.web.security.SecurityUtils;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class BookViewService {

    private final Logger log = LoggerFactory.getLogger(BookViewService.class);
    private final BookViewRepository bookViewRepository;

    public BookViewService(BookViewRepository bookViewRepository) {
        this.bookViewRepository = bookViewRepository;
    }

    public BookView save(String bookId) {
        log.debug("Request to save book view");
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        BookView bookView = bookViewRepository.findByBookIdAndUserId(bookId, userId);
        if (bookView == null) {
            BookView newBookView = new BookView();
            newBookView.setBookId(bookId);
            newBookView.setUserId(userId);
            newBookView.setViewCount(1);
            return bookViewRepository.save(newBookView);
        } else {
            int viewCount = bookView.getViewCount();
            bookView.setViewCount(viewCount + 1);
            return bookViewRepository.save(bookView);
        }
    }

    public int getViewCount(String bookId) {
        log.debug("Request to get view count of book {}", bookId);
        List<BookView> bookViewList = bookViewRepository.findByBookId(bookId);
        return bookViewList.stream().mapToInt(BookView::getViewCount).sum();
    }
}
