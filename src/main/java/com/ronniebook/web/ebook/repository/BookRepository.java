package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.BookStatus;
import java.util.List;
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

    @Query(
        "{'$and' : [{'$or':[" +
        "{ 'book_name' : { $regex: ?0, $options: 'i' } }, " +
        "{ 'title' : { $regex: ?0, $options: 'i' } }," +
        "{ 'author' : { $regex: ?0, $options: 'i' } }," +
        "{ 'description' : { $regex: ?0, $options: 'i' } }" +
        "{ 'category' : { $regex: ?0, $options: 'i' } }" +
        "]}, " +
        "{'bookStatus': ?1, 'isDeleted': { '$ne': true }}]}"
    )
    Page<Book> findByBookStatusAndSearchText(Pageable pageable, String searchText, BookStatus bookStatus);

    @Query("{ 'isDeleted' : { '$ne' : true }, '_id' : { '$in' : ?0 } }")
    Page<Book> findAllWithBookIds(Pageable pageable, List<String> bookIds);

    @Query(
        "{'$and' : [{'$or':[" +
        "{ 'book_name' : { $regex: ?0, $options: 'i' } }, " +
        "{ 'title' : { $regex: ?0, $options: 'i' } }," +
        "{ 'author' : { $regex: ?0, $options: 'i' } }," +
        "{ 'description' : { $regex: ?0, $options: 'i' } }" +
        "{ 'category' : { $regex: ?0, $options: 'i' } }" +
        "]}, " +
        "{'_id' : { '$in' : ?1 }, 'isDeleted': { '$ne': true }}]}"
    )
    Page<Book> findByTextWithBookIds(Pageable pageable, String text, List<String> bookIds);

    @Query("{ 'isDeleted' : { '$ne' : true }, '_id' : { '$nin' : ?0 } }")
    Page<Book> findAllExceptBookIds(Pageable pageable, List<String> bookIds);

    @Query(
        "{'$and' : [{'$or':[" +
        "{ 'book_name' : { $regex: ?0, $options: 'i' } }, " +
        "{ 'title' : { $regex: ?0, $options: 'i' } }," +
        "{ 'author' : { $regex: ?0, $options: 'i' } }," +
        "{ 'description' : { $regex: ?0, $options: 'i' } }" +
        "{ 'category' : { $regex: ?0, $options: 'i' } }" +
        "]}, " +
        "{'_id' : { '$nin' : ?1 }, 'isDeleted': { '$ne': true }}]}"
    )
    Page<Book> findByTextExceptBookIds(Pageable pageable, String text, List<String> bookIds);
}
