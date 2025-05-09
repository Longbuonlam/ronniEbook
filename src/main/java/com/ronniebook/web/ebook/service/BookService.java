package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.BookStatus;
import com.ronniebook.web.ebook.domain.ElasticsearchBookDocument;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.ebook.repository.ElasticsearchBookDocumentRepository;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BookService {

    public static final String BOOK_CACHE_NAME = "books";
    private final Logger log = LoggerFactory.getLogger(BookService.class);
    private final UserService userService;
    private final BookRepository bookRepository;
    private static final String ENTITY_NAME = "book";
    private final MongoTemplate mongoTemplate;
    private final CloudinaryService cloudinaryService;
    private final RonnieFileService ronnieFileService;
    private final HybridRSService hybridRSService;
    private final ElasticsearchBookDocumentRepository elasticsearchBookDocumentRepository;

    public BookService(
        UserService userService,
        BookRepository bookRepository,
        MongoTemplate mongoTemplate,
        CloudinaryService cloudinaryService,
        RonnieFileService ronnieFileService,
        HybridRSService hybridRSService,
        ElasticsearchBookDocumentRepository elasticsearchBookDocumentRepository
    ) {
        this.userService = userService;
        this.bookRepository = bookRepository;
        this.mongoTemplate = mongoTemplate;
        this.cloudinaryService = cloudinaryService;
        this.ronnieFileService = ronnieFileService;
        this.hybridRSService = hybridRSService;
        this.elasticsearchBookDocumentRepository = elasticsearchBookDocumentRepository;
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

            if (bookPage.isEmpty()) {
                List<Book> books = findByContentWithElasticsearch(searchText);
                bookPage = new PageImpl<>(books, pageable, books.size());
            }
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
        if (newBook.getBookStatus() != null) {
            existingBook.setBookStatus(newBook.getBookStatus());
        }
        if (newBook.getImageUrl() != null) {
            existingBook.setImageUrl(newBook.getImageUrl());
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
            return bookRepository.findByBookStatusAndNotDeleted(pageable, bookStatus);
        }
        bookPage = bookRepository.findByBookStatusAndSearchText(pageable, searchText, bookStatus);

        if (bookPage.isEmpty()) {
            List<Book> books = findByContentWithElasticsearch(searchText);
            List<Book> results = books.stream().filter(book -> book.getBookStatus() == bookStatus).toList();
            bookPage = new PageImpl<>(results, pageable, results.size());
        }
        return bookPage;
    }

    @Async
    public void upsertBook(Book book, MultipartFile image) {
        log.debug("Create new thread to upsert book {}", book);
        try {
            AtomicReference<String> imageUrlRef = new AtomicReference<>(null);
            try {
                imageUrlRef.set(uploadImage(image));
            } catch (Exception e) {
                log.error("Failed to upload image, continuing without image", e);
            }
            String storageId = createStorage(book.getBookName());
            bookRepository
                .findById(book.getId())
                .ifPresent(b -> {
                    b.setImageUrl(imageUrlRef.get());
                    b.setStorageId(storageId);
                    bookRepository.save(b);
                });
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    @Async
    public void updateChapterCount(String bookId, boolean increase) {
        log.debug("New thread to update chapter count of book id {}", bookId);
        Book book = findOne(bookId);
        int chapterCount = book.getChapterCount();
        if (increase) {
            chapterCount++;
        } else {
            if (chapterCount == 0) {
                throw new BadRequestAlertException("", "", "Chapter count must not less than 0");
            }
            chapterCount--;
        }
        book.setChapterCount(chapterCount);
        save(book);
    }

    private String uploadImage(MultipartFile image) {
        log.debug("Request to upload image to cloudinary");
        try {
            if (image.getSize() > 20 * 1024 * 1024) {
                throw new BadRequestAlertException("", ENTITY_NAME, "File size exceeds the maximum allowed size of 20MB.");
            }

            String contentType = image.getContentType();
            if (!cloudinaryService.isImage(contentType)) {
                throw new BadRequestAlertException("", ENTITY_NAME, "Invalid MIME type. Only image files are allowed!");
            }

            if (!cloudinaryService.hasImageExtension(image.getOriginalFilename())) {
                throw new BadRequestAlertException("", ENTITY_NAME, "Invalid file extension. Only image files are allowed!");
            }
            return cloudinaryService.uploadImage(cloudinaryService.convertMultiPartToFile(image));
        } catch (Exception e) {
            throw new BadRequestAlertException("", "", "Error when upload image to cloudinary");
        }
    }

    private String createStorage(String bookName) {
        try {
            return ronnieFileService.createNewFolder(bookName);
        } catch (IOException e) {
            throw new BadRequestAlertException("", "", "Error in create storage for book");
        }
    }

    public Page<Book> getRecommendBook(Pageable pageable) {
        log.debug("get recommend books");
        List<String> bookIds = hybridRSService.getRecommendBookIDs();
        return bookRepository.findAllWithBookIds(pageable, bookIds);
    }

    public Page<Book> getSimilarBooks(Pageable pageable, String bookId) {
        log.debug("get similar book with book id {}", bookId);
        List<String> bookIds = hybridRSService.getSimilarBookIDs(bookId);
        return bookRepository.findAllWithBookIds(pageable, bookIds);
    }

    public List<Book> findByContentWithElasticsearch(String searchText) {
        log.debug("Request to find books by content with elasticsearch");
        List<ElasticsearchBookDocument> documentList = elasticsearchBookDocumentRepository.searchByContent(searchText);
        return documentList.stream().map(ElasticsearchBookDocument::getBookId).distinct().map(this::findOne).toList();
    }
}
