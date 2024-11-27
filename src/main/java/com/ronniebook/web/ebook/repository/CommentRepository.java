package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    Page<Comment> findAllByBookId(Pageable pageable, String bookId);
}
