package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.FavouriteBook;
import com.ronniebook.web.ebook.repository.FavouriteBookRepository;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class FavouriteBookService {

    public static final String BOOK_CACHE_NAME = "favourite-books";
    private final Logger log = LoggerFactory.getLogger(FavouriteBookService.class);
    private final BookService bookService;
    private final FavouriteBookRepository favouriteBookRepository;

    public FavouriteBookService(BookService bookService, FavouriteBookRepository favouriteBookRepository) {
        this.bookService = bookService;
        this.favouriteBookRepository = favouriteBookRepository;
    }

    /**
     * Save a Favourite Book.
     *
     * @param bookId the id of the favourite book.
     * @return the persisted entity.
     */
    public FavouriteBook save(String bookId) {
        log.debug("Request to save favourite book with id : {}", bookId);
        Book book = bookService.findOne(bookId);
        FavouriteBook favouriteBook = new FavouriteBook();
        favouriteBook.setBookId(bookId);
        favouriteBook.setAddDate(Instant.now());
        favouriteBook.setBookName(book.getBookName());
        favouriteBook.setAuthor(book.getAuthor());
        return favouriteBookRepository.save(favouriteBook);
    }

    /**
     * Get all the Favourite Books.
     *
     * @param pageable   the pagination information.
     * @param searchText String
     * @return the list of entities.
     */
    public Page<FavouriteBook> findAll(Pageable pageable, String searchText) {
        log.debug("Request to get all Favourite Books");
        Page<FavouriteBook> bookPage;
        // Add SortPage
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "book_name");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }
        if (searchText == null) {
            bookPage = favouriteBookRepository.findAll(pageable);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            bookPage = favouriteBookRepository.findByText(pageable, searchText);
        }
        return bookPage;
    }

    /**
     * Delete the Favourite Book by id.
     *
     * @param id the id of the entity.
     */
    @CacheEvict(value = BOOK_CACHE_NAME)
    public void delete(String id) {
        log.debug("Request to delete Favourite Book : {}", id);
        FavouriteBook favouriteBook = favouriteBookRepository.findById(id).orElseThrow();
        favouriteBookRepository.delete(favouriteBook);
    }
}
