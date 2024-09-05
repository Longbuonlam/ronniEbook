package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.ReadingProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the ReadingProgress entity.
 */
@Repository
public interface ReadingProgressRepository extends MongoRepository<ReadingProgress, String> {}
