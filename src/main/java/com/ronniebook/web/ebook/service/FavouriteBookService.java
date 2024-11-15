package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.FavouriteBook;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.ebook.repository.FavouriteBookRepository;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.util.ArrayList;
import java.util.List;
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
    private final BookRepository bookRepository;
    private final FavouriteBookRepository favouriteBookRepository;

    public FavouriteBookService(BookRepository bookRepository, FavouriteBookRepository favouriteBookRepository) {
        this.bookRepository = bookRepository;
        this.favouriteBookRepository = favouriteBookRepository;
    }

    public FavouriteBook save(FavouriteBook favouriteBook) {
        log.debug("Request to save favourite book");
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        favouriteBook.setUserId(userId);
        return favouriteBookRepository.save(favouriteBook);
    }

    /**
     * Get all the Favourite Books.
     *
     * @param pageable   the pagination information.
     * @param searchText String
     * @return the list of entities.
     */
    public Page<Book> findAll(Pageable pageable, String searchText) {
        log.debug("Request to get all Favourite Books");
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        List<FavouriteBook> favouriteBookList = favouriteBookRepository.findByUserId(userId);
        List<String> listBookIds = new ArrayList<>();
        for (FavouriteBook favouriteBook : favouriteBookList) {
            listBookIds.add(favouriteBook.getBookId());
        }

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
            bookPage = bookRepository.findAllWithBookIds(pageable, listBookIds);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            bookPage = bookRepository.findByTextWithBookIds(pageable, searchText, listBookIds);
        }
        return bookPage;
    }

    /**
     * Delete the Favourite Book by id.
     *
     * @param id the id of the entity.
     */
    //    @CacheEvict(value = BOOK_CACHE_NAME)
    public void delete(String id) {
        log.debug("Request to delete Favourite Book : {}", id);
        FavouriteBook favouriteBook = favouriteBookRepository.findById(id).orElseThrow();
        favouriteBookRepository.delete(favouriteBook);
    }

    public boolean isExisted(String bookId) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        return favouriteBookRepository.findFavouriteById(bookId, userId) != null;
    }
}
