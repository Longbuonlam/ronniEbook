package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.BookStatus;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class BookService {

    public static final String BOOK_CACHE_NAME = "books";
    private final Logger log = LoggerFactory.getLogger(BookService.class);
    private final UserService userService;
    private final BookRepository bookRepository;
    private static final String ENTITY_NAME = "book";
    private final MongoTemplate mongoTemplate;

    public BookService(UserService userService, BookRepository bookRepository, MongoTemplate mongoTemplate) {
        this.userService = userService;
        this.bookRepository = bookRepository;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Save a Book.
     *
     * @param book the entity to save.
     * @return the persisted entity.
     */
    public Book save(Book book) {
        log.debug("Request to save Book : {}", book);
        return bookRepository.save(book);
    }

    /**
     * Get all the Books.
     *
     * @param pageable   the pagination information.
     * @param searchText String
     * @return the list of entities.
     */
    public Page<Book> findAll(Pageable pageable, String searchText) {
        log.debug("Request to get all Books");
        Page<Book> bookPage;
        // Add SortPage
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "book_name");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }
        if (searchText == null) {
            bookPage = bookRepository.findAll(pageable);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            bookPage = bookRepository.findByText(pageable, searchText);
        }
        return bookPage;
    }

    /**
     * Partially update a Book.
     *
     * @param newBook the entity to update partially.
     * @return the persisted entity.
     */
    //    @CacheEvict(value = BOOK_CACHE_NAME, key = "#existingBook.id")
    public Optional<Book> update(Book existingBook, Book newBook) {
        log.debug("Request to partially update Book : {}", newBook);
        if (!userService.isAdmin()) {
            throw new BadRequestAlertException("", "", "Only admin can update book");
        }
        if (newBook.getBookName() != null) {
            existingBook.setBookName(newBook.getBookName());
        }
        if (newBook.getAuthor() != null) {
            existingBook.setAuthor(newBook.getAuthor());
        }
        if (newBook.getTitle() != null) {
            existingBook.setTitle(newBook.getTitle());
        }
        if (newBook.getDescription() != null) {
            existingBook.setDescription(newBook.getDescription());
        }
        if (newBook.getCategory() != null) {
            existingBook.setCategory(newBook.getCategory());
        }
        if (newBook.getLanguage() != null) {
            existingBook.setLanguage(newBook.getLanguage());
        }
        bookRepository.save(existingBook);
        return Optional.of(existingBook);
    }

    /**
     * Delete the Book by id.
     *
     * @param id the id of the entity.
     */
    //    @CacheEvict(value = BOOK_CACHE_NAME)
    public void delete(String id) {
        log.debug("Request to delete Book : {}", id);
        if (!userService.isAdmin()) {
            throw new BadRequestAlertException("", "", "Only admin can delete book");
        }
        Book book = bookRepository.findById(id).orElseThrow();
        //Soft delete book
        book.setDeleted(true);
        bookRepository.save(book);
    }

    //    @Cacheable(BOOK_CACHE_NAME)
    public Book findOne(String id) {
        log.debug("Request to get Book : {}", id);
        Query query = new Query(Criteria.where("_id").is(id).and("isDeleted").ne(true));
        Book book = mongoTemplate.findOne(query, Book.class);
        if (book == null) {
            throw new BadRequestAlertException("Id invalid", ENTITY_NAME, "BookId not found");
        }
        return book;
    }

    public Page<Book> findBookByStatus(Pageable pageable, BookStatus bookStatus, String searchText) {
        log.debug("Request to get release books and unrelease books");
        // Add SortPage
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "book_name");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }

        if (searchText == null) {
            if (bookStatus == BookStatus.DONE) {
                return bookRepository.findByBookStatusAndNotDeleted(pageable, BookStatus.DONE);
            }
            return bookRepository.findByBookStatusAndNotDeleted(pageable, BookStatus.IN_PROGRESS);
        }

        if (bookStatus == BookStatus.DONE) {
            return bookRepository.findByBookStatusAndSearchText(pageable, searchText, BookStatus.DONE);
        }
        return bookRepository.findByBookStatusAndSearchText(pageable, searchText, BookStatus.IN_PROGRESS);
    }
}
