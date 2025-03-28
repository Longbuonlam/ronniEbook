package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Comment;
import com.ronniebook.web.ebook.domain.Rating;
import com.ronniebook.web.ebook.domain.dto.CommentDTO;
import com.ronniebook.web.ebook.service.CommentService;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class CommentResource {

    private final Logger log = LoggerFactory.getLogger(CommentResource.class);
    private final CommentService commentService;
    private static final String ENTITY_NAME = "comment";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserService userService;

    public CommentResource(CommentService commentService, UserService userService) {
        this.commentService = commentService;
        this.userService = userService;
    }

    @GetMapping("/{bookId}/comments")
    public ResponseEntity<Page<CommentDTO>> getAllComment(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @PathVariable String bookId
    ) {
        log.debug("REST request to get a page of comments");
        Page<CommentDTO> page = commentService.findAllByBookId(pageable, bookId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @PostMapping("/{bookId}/comments")
    public ResponseEntity<Comment> createComment(@RequestBody CommentDTO commentDTO, @PathVariable String bookId)
        throws URISyntaxException {
        log.debug("REST request to save comment : {}", commentDTO);
        if (commentDTO.getId() != null) {
            throw new BadRequestAlertException("A new comment cannot already have an ID", ENTITY_NAME, "id exists");
        }
        commentDTO.setBookId(bookId);
        Comment result = commentService.save(commentDTO);

        return ResponseEntity.created(new URI("/api/comments/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
            .body(result);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        log.debug("REST request to delete Comment : {}", id);
        Comment comment = commentService.findOne(id);
        String loginUser = SecurityUtils.getCurrentUserLogin().orElseThrow();
        if (loginUser.equals(comment.getCreatedBy()) || userService.isAdmin()) {
            commentService.delete(comment);
            return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
        }
        throw new BadRequestAlertException("", "", "You don't have permission to delete comment");
    }

    @PatchMapping(value = "/comments/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Comment> updateComment(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody Comment comment
    ) throws URISyntaxException {
        log.debug("REST request to partial update Comment partially : {}, {}", id, comment);
        if (comment.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, comment.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Comment existingComment = commentService.findOne(id);

        Optional<Comment> result = commentService.update(existingComment, comment);

        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, comment.getId()));
    }

    @GetMapping("/comments/{id}")
    public Comment getComment(@PathVariable String id) {
        log.debug("REST request to get Book : {}", id);
        return commentService.findOne(id);
    }

    @GetMapping("/comments/getRating/{bookId}")
    public Rating getBookRating(@PathVariable String bookId) {
        return commentService.getBookRating(bookId);
    }
}
