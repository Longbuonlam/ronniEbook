package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.FavouriteBook;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the FavouriteBook entity.
 */
@Repository
public interface FavouriteBookRepository extends MongoRepository<FavouriteBook, String> {}
