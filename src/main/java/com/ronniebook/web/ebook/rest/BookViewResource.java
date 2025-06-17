package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.BookView;
import com.ronniebook.web.ebook.service.BookViewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BookViewResource {

    private final Logger log = LoggerFactory.getLogger(BookViewResource.class);
    private final BookViewService bookViewService;

    public BookViewResource(BookViewService bookViewService) {
        this.bookViewService = bookViewService;
    }

    @PostMapping("/book-view")
    public ResponseEntity<BookView> saveViewCount(@RequestParam String bookId) {
        log.debug("REST request to save view count, bookId {}", bookId);
        BookView result = bookViewService.save(bookId);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/book-view/get-view-count/{bookId}")
    public ResponseEntity<Integer> getViewCount(@PathVariable String bookId) {
        log.debug("REST request to get view count of book id {}", bookId);
        int viewCount = bookViewService.getViewCount(bookId);
        return ResponseEntity.ok().body(viewCount);
    }
}
