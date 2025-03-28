package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends MongoRepository<Rating, String> {
    Rating findByUserIdAndBookId(String userId, String bookId);
}
