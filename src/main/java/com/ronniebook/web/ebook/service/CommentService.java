package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Comment;
import com.ronniebook.web.ebook.repository.CommentRepository;
import com.ronniebook.web.security.SecurityUtils;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final Logger log = LoggerFactory.getLogger(CommentService.class);

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment save(Comment comment) {
        log.debug("Request to save comment : {}", comment);
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        comment.setUserId(userId);
        return commentRepository.save(comment);
    }

    public Optional<Comment> update(Comment existingComment, Comment newComment) {
        log.debug("Request to update Comment : {}", newComment);
        if (newComment.getDescription() != null) {
            existingComment.setDescription(newComment.getDescription());
        }
        if (newComment.getRating() != 0) {
            existingComment.setRating(newComment.getRating());
        }
        return Optional.of(commentRepository.save(existingComment));
    }

    public void delete(Comment comment) {
        log.debug("Request to delete Comment: {}", comment.getId());
        commentRepository.delete(comment);
    }

    public Page<Comment> findAllByBookId(Pageable pageable, String bookId) {
        log.debug("Request to get all Comment by BookId : {}", bookId);
        if (pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.DESC, "createdDate");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        return commentRepository.findAllByBookId(pageable, bookId);
    }

    public Comment findOne(String id) {
        return commentRepository.findById(id).orElseThrow();
    }
}
