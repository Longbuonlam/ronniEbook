package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.ReadingProgress;
import com.ronniebook.web.ebook.service.ReadingProgressService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
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
    public ResponseEntity<ReadingProgress> createReadingProgress(@RequestBody ReadingProgress readingProgress) throws URISyntaxException {
        log.debug("Request to save reading progress");
        if (readingProgress.getId() != null) {
            throw new BadRequestAlertException("A new reading progress cannot already have an ID", ENTITY_NAME, "id exists");
        }
        ReadingProgress result = readingProgressService.save(readingProgress);
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
}
