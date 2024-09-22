package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.ReadBook;
import com.ronniebook.web.ebook.service.ReadBookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReadBookResource {

    private final ReadBookService readBookService;
    private final Logger log = LoggerFactory.getLogger(ReadBookResource.class);

    public ReadBookResource(ReadBookService readBookService) {
        this.readBookService = readBookService;
    }

    @GetMapping("/read-book")
    public Page<ReadBook> getReadBook(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of read books");
        return readBookService.findAll(pageable, searchText);
    }

    @DeleteMapping("/read-book")
    public void deleteReadBook(@RequestParam String id) {
        log.debug("Rest request to delete read-book");
        readBookService.delete(id);
    }
}
