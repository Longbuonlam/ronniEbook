package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.BookStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the Book entity.
 */
@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    @Query("{'isDeleted' : {'$ne' : true}}")
    Page<Book> findAll(Pageable pageable);

    @Query(
        "{'$and' : [{'$or':[" +
        "{ 'book_name' : { $regex: ?0, $options: 'i' } }, " +
        "{ 'title' : { $regex: ?0, $options: 'i' } }," +
        "{ 'author' : { $regex: ?0, $options: 'i' } }," +
        "{ 'description' : { $regex: ?0, $options: 'i' } }" +
        "{ 'category' : { $regex: ?0, $options: 'i' } }" +
        "]}, " +
        "{'isDeleted': { '$ne': true }}]}"
    )
    Page<Book> findByText(Pageable pageable, String text);

    @Query("{'bookStatus': ?0, 'isDeleted': false}")
    Page<Book> findByBookStatusAndNotDeleted(Pageable pageable, BookStatus bookStatus);
}
