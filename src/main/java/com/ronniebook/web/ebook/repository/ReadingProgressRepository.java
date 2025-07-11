package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.ReadingProgress;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the ReadingProgress entity.
 */
@Repository
public interface ReadingProgressRepository extends MongoRepository<ReadingProgress, String> {
    List<ReadingProgress> findByUserId(String userId);

    ReadingProgress findByUserIdAndBookId(String userId, String bookId);
}
