package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Comment;
import com.ronniebook.web.ebook.domain.Rating;
import com.ronniebook.web.ebook.domain.dto.CommentDTO;
import com.ronniebook.web.ebook.repository.CommentRepository;
import com.ronniebook.web.ebook.repository.RatingRepository;
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
    private final RatingRepository ratingRepository;
    private final Logger log = LoggerFactory.getLogger(CommentService.class);

    public CommentService(CommentRepository commentRepository, RatingRepository ratingRepository) {
        this.commentRepository = commentRepository;
        this.ratingRepository = ratingRepository;
    }

    public Comment save(CommentDTO commentDTO) {
        log.debug("Request to save comment : {}", commentDTO);
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        if (commentDTO.getRating() != null && commentDTO.getRating() != 0) {
            Rating rating = ratingRepository.findByUserIdAndBookId(userId, commentDTO.getBookId());
            if (rating != null) {
                rating.setBookRating(commentDTO.getRating());
            } else {
                rating = new Rating(userId, commentDTO.getBookId(), commentDTO.getRating());
            }
            ratingRepository.save(rating);
        }
        Comment comment = new Comment(userId, commentDTO.getBookId(), commentDTO.getDescription());
        commentRepository.save(comment);
        return comment;
    }

    public Optional<Comment> update(Comment existingComment, CommentDTO newCommentDTO) {
        log.debug("Request to update Comment : {}", newCommentDTO);
        if (newCommentDTO.getDescription() != null) {
            existingComment.setDescription(newCommentDTO.getDescription());
        }
        if (newCommentDTO.getRating() != null && newCommentDTO.getRating() != 0) {
            updateRating(existingComment, newCommentDTO);
        }
        return Optional.of(commentRepository.save(existingComment));
    }

    public void delete(Comment comment) {
        log.debug("Request to delete Comment: {}", comment.getId());
        Rating rating = ratingRepository.findByUserIdAndBookId(comment.getUserId(), comment.getBookId());
        commentRepository.delete(comment);
        ratingRepository.delete(rating);
    }

    public Page<CommentDTO> findAllByBookId(Pageable pageable, String bookId) {
        log.debug("Request to get all Comment by BookId : {}", bookId);
        if (pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.DESC, "createdDate");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        Page<Comment> page = commentRepository.findAllByBookId(pageable, bookId);
        return page.map(this::mapToDTO);
    }

    public Comment findOne(String id) {
        return commentRepository.findById(id).orElseThrow();
    }

    private CommentDTO mapToDTO(Comment comment) {
        Rating rating = ratingRepository.findByUserIdAndBookId(comment.getUserId(), comment.getBookId());
        return new CommentDTO(
            comment.getId(),
            comment.getUserId(),
            comment.getBookId(),
            comment.getDescription(),
            rating.getBookRating(),
            comment.getCreatedDate()
        );
    }

    public Rating getBookRating(String bookId) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        log.debug("Request to get book rating of user id {}, book id {}", userId, bookId);
        return ratingRepository.findByUserIdAndBookId(userId, bookId);
    }

    private void updateRating(Comment comment, CommentDTO commentDTO) {
        Rating rating = ratingRepository.findByUserIdAndBookId(comment.getUserId(), comment.getBookId());
        rating.setBookRating(commentDTO.getRating());
        ratingRepository.save(rating);
    }
}
