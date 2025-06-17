package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.BookView;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookViewRepository extends MongoRepository<BookView, String> {
    BookView findByBookIdAndUserId(String bookId, String userId);

    List<BookView> findByBookId(String bookId);
}
