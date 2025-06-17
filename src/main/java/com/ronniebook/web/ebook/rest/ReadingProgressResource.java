package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.ReadingProgress;
import com.ronniebook.web.ebook.service.ReadingProgressService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;

@RestController
@RequestMapping("/api")
public class ReadingProgressResource {

    private final Logger log = LoggerFactory.getLogger(ReadingProgressResource.class);
    private static final String ENTITY_NAME = "reading-progress";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ReadingProgressService readingProgressService;

    public ReadingProgressResource(ReadingProgressService readingProgressService) {
        this.readingProgressService = readingProgressService;
    }

    @PostMapping("/reading-progress")
    public ResponseEntity<ReadingProgress> createReadingProgress(@RequestParam String bookId, @RequestParam String chapterStorageId)
        throws URISyntaxException {
        log.debug("Request to save reading progress");
        ReadingProgress result = readingProgressService.save(bookId, chapterStorageId);
        readingProgressService.checkAndSaveToHistory(bookId);
        return ResponseEntity.created(new URI("/api/reading-progress/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
            .body(result);
    }

    @GetMapping("/reading-progress")
    public Page<Book> getAllReadingProgress(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of Books");
        return readingProgressService.findAllReadingProgressByUserId(pageable, searchText);
    }

    @DeleteMapping("/reading-progress/{bookId}")
    public ResponseEntity<Void> deleteReadingProgress(@PathVariable String bookId) {
        log.debug("REST request to delete reading progress, bookId : {}", bookId);
        readingProgressService.delete(bookId);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, bookId)).build();
    }

    @GetMapping("/other-books")
    public Page<Book> getAllOtherBooks(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        return readingProgressService.findOtherBookByUserId(pageable, searchText);
    }

    @GetMapping("/reading-progress/{bookId}")
    public ResponseEntity<Integer> getBookProcess(@PathVariable String bookId) {
        log.debug("Rest request to get process of book {}", bookId);
        int process = readingProgressService.getProcess(bookId);
        return ResponseEntity.ok().body(process);
    }

    @GetMapping("/reading-progress/check-saved-chapters")
    public ResponseEntity<Boolean> hadSavedProgress(@RequestParam String bookId, @RequestParam String chapterStorageId) {
        log.debug("Rest request to check if progress had been saved : book id {}, chapter storage id {}", bookId, chapterStorageId);
        Boolean result = readingProgressService.hadProcessSaved(bookId, chapterStorageId);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/reading-progress/get-finished-chapters/{bookId}")
    public ResponseEntity<Set<String>> getFinishedChapters(@PathVariable String bookId) {
        log.debug("Rest request to get all finished chapters : book {}", bookId);
        Set<String> result = readingProgressService.getAllFinishedChapters(bookId);
        return ResponseEntity.ok().body(result);
    }
}
