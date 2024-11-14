package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.History;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the ReadBook entity.
 */
@Repository
public interface HistoryRepository extends MongoRepository<History, String> {
    List<History> findByUserId(String userId);
}
