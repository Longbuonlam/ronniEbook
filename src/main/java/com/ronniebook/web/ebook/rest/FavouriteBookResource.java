package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.FavouriteBook;
import com.ronniebook.web.ebook.service.FavouriteBookService;
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
public class FavouriteBookResource {

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final Logger log = LoggerFactory.getLogger(FavouriteBookResource.class);
    private final FavouriteBookService favouriteBookService;
    private static final String ENTITY_NAME = "favourite-book";

    public FavouriteBookResource(FavouriteBookService favouriteBookService) {
        this.favouriteBookService = favouriteBookService;
    }

    /**
     * {@code POST  /favourite-books} : Create a new Favourite Book.
     *
     * @param book the book to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new book, or with status {@code 400 (Bad Request)} if the book has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/favourite-books")
    public ResponseEntity<FavouriteBook> createFavouriteBook(@RequestBody FavouriteBook book) throws URISyntaxException {
        log.debug("REST request to save favourite book : {}", book);
        //Check if the book had been saved already
        if (favouriteBookService.isExisted(book.getBookId())) {
            throw new BadRequestAlertException("", "", "Book had already existed");
        }
        if (book.getId() != null) {
            throw new BadRequestAlertException("A new favourite book cannot already have an ID", ENTITY_NAME, "id exists");
        }
        FavouriteBook result = favouriteBookService.save(book);
        return ResponseEntity.created(new URI("/api/favourite-books/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
            .body(result);
    }

    /**
     * {@code GET  /favourite-books} : get all the favourite books.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of favourite books in body.
     */
    @GetMapping("/favourite-books")
    public Page<Book> getAllFavouriteBooks(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("REST request to get a page of Favourite Books");
        return favouriteBookService.findAll(pageable, searchText);
    }

    /**
     * {@code DELETE  /favourite-books/:id} : delete the "id" favourite book.
     *
     * @param bookId the id of the favourite book to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/favourite-books/{bookId}")
    public ResponseEntity<Void> deleteFavouriteBook(@PathVariable String bookId) {
        log.debug("REST request to delete favourite book : {}", bookId);
        favouriteBookService.delete(bookId);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, bookId)).build();
    }

    @GetMapping("/favourite-books/{bookId}")
    public ResponseEntity<Boolean> isFavouriteBook(@PathVariable String bookId) {
        log.debug("REST request to check if {} is favourite book", bookId);
        return ResponseEntity.ok().body(favouriteBookService.isExisted(bookId));
    }
}
