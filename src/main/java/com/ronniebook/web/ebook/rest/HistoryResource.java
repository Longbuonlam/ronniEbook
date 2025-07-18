package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.History;
import com.ronniebook.web.ebook.service.HistoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HistoryResource {

    private final HistoryService historyService;
    private final Logger log = LoggerFactory.getLogger(HistoryResource.class);

    public HistoryResource(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/history")
    public Page<Book> getHistory(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of history");
        return historyService.findAll(pageable, searchText);
    }

    @DeleteMapping("/history/{bookId}")
    public void deleteHistory(@PathVariable String bookId) {
        log.debug("Rest request to delete history, book id {}", bookId);
        historyService.delete(bookId);
    }
}
