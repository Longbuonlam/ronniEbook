package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.BookStatus;
import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.ebook.service.BookService;
import com.ronniebook.web.ebook.service.CloudinaryService;
import com.ronniebook.web.security.AuthoritiesConstants;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class BookResource {

    private final Logger log = LoggerFactory.getLogger(BookResource.class);
    private static final String ENTITY_NAME = "book";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final BookService bookService;
    private final BookRepository bookRepository;

    public BookResource(BookService bookService, BookRepository bookRepository) {
        this.bookService = bookService;
        this.bookRepository = bookRepository;
    }

    /**
     * {@code POST  /books} : Create a new Book.
     *
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new book, or with status {@code 400 (Bad Request)} if the book has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/books")
    @PreAuthorize("hasRole('" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<Book> createBook(
        @RequestParam String bookName,
        @RequestParam String title,
        @RequestParam String author,
        @RequestParam String description,
        @RequestParam String category,
        @RequestParam LanguageCode language,
        @RequestParam BookStatus bookStatus,
        @RequestParam MultipartFile image
    ) throws URISyntaxException {
        Book book = new Book(bookName, title, author, description, category, language, bookStatus);
        log.debug("REST request to save book : {}", book);
        if (book.getId() != null) {
            throw new BadRequestAlertException("A new book cannot already have an ID", ENTITY_NAME, "id exists");
        }
        Book result = bookService.save(book);
        bookService.upsertBook(result, image);

        return ResponseEntity.created(new URI("/api/books/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
            .body(result);
    }

    /**
     * {@code GET  /books} : get all the books.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of books in body.
     */
    @GetMapping("/books")
    public Page<Book> getAllBooks(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of Books");
        return bookService.findAll(pageable, searchText);
    }

    /**
     * {@code GET  /books/:id} : get the "id" book.
     *
     * @param id the id of the book to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the book, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/books/{id}")
    public Book getBook(@PathVariable String id) {
        log.debug("REST request to get Book : {}", id);
        return bookService.findOne(id);
    }

    /**
     * {@code DELETE  /books/:id} : delete the "id" book.
     *
     * @param id the id of the book to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable String id) {
        log.debug("REST request to delete Book : {}", id);
        bookService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code PATCH  /books/:id} : Partial updates given fields of an existing book, field will ignore if it is null
     *
     * @param id        the id of the book to save.
     * @param book the book to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated book,
     * or with status {@code 400 (Bad Request)} if the book is not valid,
     * or with status {@code 404 (Not Found)} if the book is not found,
     * or with status {@code 500 (Internal Server Error)} if the book couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/books/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Book> updateBook(@PathVariable(value = "id", required = false) final String id, @RequestBody Book book)
        throws URISyntaxException {
        log.debug("REST request to partial update Book partially : {}, {}", id, book);
        if (book.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, book.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!bookRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Book existingBook = bookService.findOne(id);

        Optional<Book> result = bookService.update(existingBook, book);

        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, book.getId()));
    }

    @GetMapping("/release-books")
    public Page<Book> getReleaseBooks(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of Release Books");
        return bookService.findBookByStatus(pageable, BookStatus.DONE, searchText);
    }

    @GetMapping("/unrelease-books")
    public Page<Book> getUnReleaseBooks(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of UnRelease Books");
        return bookService.findBookByStatus(pageable, BookStatus.IN_PROGRESS, searchText);
    }
}
