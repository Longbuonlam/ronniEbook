package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.Chapter;
import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.repository.ChapterRepository;
import com.ronniebook.web.ebook.service.BookService;
import com.ronniebook.web.ebook.service.ChapterService;
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
        Book book = bookService.findOne(bookId);
        Page<Chapter> page = chapterService.findAll(pageable, book, searchText);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    /**
     * {@code POST  /chapters} : Create a new chapter.
     *
     * @param files MultipartFile[]
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new chapter, or with status {@code 400 (Bad Request)} if the chapter has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     * @throws IOException        IOException
     */
    @PostMapping("/chapters")
    public ResponseEntity<List<Chapter>> createChapter(
        @RequestParam String bookId,
        @RequestParam(required = false) String chapterName,
        @RequestParam(required = false) String fileVersion,
        @RequestParam(required = false) LanguageCode sourceLanguage,
        @RequestParam("file") MultipartFile[] files
    ) throws URISyntaxException, IOException {
        Book book = bookService.findOne(bookId);

        List<Chapter> chaps = new ArrayList<Chapter>();

        // Validate file name
        List<String> fileNames = Arrays.stream(files).map(MultipartFile::getOriginalFilename).toList();
        List<Chapter> chapterList = chapterRepository.findAllByBookIdAndChapterNameIn(bookId, fileNames);
        if (!chapterList.isEmpty()) {
            String message = "File name: " + chapterList.get(0).getChapterName() + " already exists.";
            throw new BadRequestAlertException(message, "Chapter", message);
        }

        //        for (MultipartFile file : files) {
        //            chaps.add(chapterService.uploadChapter(fileVersion, sourceLanguage, book, file));
        //        }
        return ResponseEntity.created(new URI("/api/chapters/" + chaps.get(0).getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, chaps.get(0).getId()))
            .body(chaps);
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
}
