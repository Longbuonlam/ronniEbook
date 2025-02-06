package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.Chapter;
import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.repository.ChapterRepository;
import com.ronniebook.web.ebook.service.BookService;
import com.ronniebook.web.ebook.service.ChapterService;
import com.ronniebook.web.security.AuthoritiesConstants;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class ChapterResource {

    private final Logger log = LoggerFactory.getLogger(ChapterResource.class);
    private static final String ENTITY_NAME = "chapter";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ChapterService chapterService;

    private final ChapterRepository chapterRepository;

    private final BookService bookService;

    private final UserService userService;

    public ChapterResource(
        ChapterService chapterService,
        ChapterRepository chapterRepository,
        BookService bookService,
        UserService userService
    ) {
        this.chapterService = chapterService;
        this.chapterRepository = chapterRepository;
        this.bookService = bookService;
        this.userService = userService;
    }

    /**
     * {@code GET  /chapters} : get all the chapters.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of chapters in body.
     */
    @GetMapping("/chapters")
    public ResponseEntity<Page<Chapter>> getAllChapter(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String bookId,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of Chapters");
        Page<Chapter> page = chapterService.findAll(pageable, bookId, searchText);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @PostMapping("/chapters")
    @PreAuthorize("hasRole('" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<Chapter> createChapter(@RequestBody Chapter chapter, @RequestParam String bookId) throws URISyntaxException {
        log.debug("REST request to save chapter : {}", chapter);
        if (chapter.getId() != null) {
            throw new BadRequestAlertException("A new chapter cannot already have an ID", ENTITY_NAME, "id exists");
        }
        chapter.setBookId(bookId);
        Chapter result = chapterService.save(chapter);

        bookService.updateChapterCount(bookId, true);
        Book book = bookService.findOne(bookId);
        chapterService.upsertChapter(result, book);

        return ResponseEntity.created(new URI("/api/chapters/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
            .body(result);
    }

    /**
     * {@code DELETE  /chapters/:id} : delete the "id" chapter.
     *
     * @param id the id of the chapter to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/chapters/{id}")
    public ResponseEntity<Void> deleteChapter(@PathVariable String id) {
        log.debug("REST request to delete Chapter : {}", id);
        Chapter chapter = chapterService.findOne(id).orElseThrow();
        Book book = bookService.findOne(chapter.getBookId());
        String loginUser = SecurityUtils.getCurrentUserLogin().orElseThrow();
        if (loginUser.equals(chapter.getCreatedBy()) || userService.isAdmin()) {
            chapterService.delete(chapter);
            bookService.updateChapterCount(book.getId(), false);

            return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
        }
        throw new BadRequestAlertException("", "", "You don't have permission to delete " + chapter.getChapterName());
    }

    /**
     * {@code PATCH  /chapters/:id} : Partial updates given fields of an existing chapter, field will ignore if it is null
     *
     * @param id        the id of the chapter to save.
     * @param chapter the chapter to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated chapter,
     * or with status {@code 400 (Bad Request)} if the chapter is not valid,
     * or with status {@code 404 (Not Found)} if the chapter is not found,
     * or with status {@code 500 (Internal Server Error)} if the chapter couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/chapters/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Chapter> updateChapter(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody Chapter chapter
    ) throws URISyntaxException {
        log.debug("REST request to partial update Chapter partially : {}, {}", id, chapter);
        if (chapter.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, chapter.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!chapterRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Chapter existingChapter = chapterService.findOne(id).orElseThrow();

        Optional<Chapter> result = chapterService.update(existingChapter, chapter);

        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, chapter.getId()));
    }

    @GetMapping("/chapters/{id}")
    public Chapter getChapter(@PathVariable String id) {
        log.debug("REST request to get Chapter : {}", id);
        return chapterService.findOne(id).orElseThrow();
    }
}
