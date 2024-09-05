package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.ReadBook;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the ReadBook entity.
 */
@Repository
public interface ReadBookRepository extends MongoRepository<ReadBook, String> {}
