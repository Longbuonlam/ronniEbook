package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.History;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the ReadBook entity.
 */
@Repository
public interface HistoryRepository extends MongoRepository<History, String> {
    @Query("{'$or':[" + "{ 'book_name' : { $regex: ?0, $options: 'i' } }, " + "{ 'author' : { $regex: ?0, $options: 'i' } }," + "]}")
    Page<History> findByText(Pageable pageable, String searchText);
}
