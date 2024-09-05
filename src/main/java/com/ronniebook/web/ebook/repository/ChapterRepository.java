package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.Chapter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the Chapter entity.
 */
@Repository
public interface ChapterRepository extends MongoRepository<Chapter, String> {}
