package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.FavouriteBook;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the FavouriteBook entity.
 */
@Repository
public interface FavouriteBookRepository extends MongoRepository<FavouriteBook, String> {
    @Query("{'userId': ?0, 'isDeleted' : {'$ne' : true}}")
    List<FavouriteBook> findByUserId(String userId);

    @Query("{ 'bookId': ?0, 'userId': ?1, 'isDeleted': { '$ne': true } }")
    FavouriteBook findFavouriteById(String bookId, String userId);

    @Query("{ 'bookId': ?0, 'userId': ?1, 'isDeleted': true }")
    FavouriteBook findDeletedFavouriteByBookIdAndUserId(String bookId, String userId);
}
