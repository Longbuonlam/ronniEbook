package com.ronniebook.web.web.rest;

import com.ronniebook.web.domain.User;
import com.ronniebook.web.repository.search.UserSearchRepository;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.service.dto.UserDTO;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.util.*;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class PublicUserResource {

    private static final Logger log = LoggerFactory.getLogger(PublicUserResource.class);

    private final UserService userService;
    private final UserSearchRepository userSearchRepository;

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    public PublicUserResource(UserSearchRepository userSearchRepository, UserService userService) {
        this.userService = userService;
        this.userSearchRepository = userSearchRepository;
    }

    /**
     * {@code GET /users} : get all users with only public information - calling this method is allowed for anyone.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body all users.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllPublicUsers(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get all public User names");

        final Page<UserDTO> page = userService.getAllPublicUsers(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * {@code SEARCH /users/_search/:query} : search for the User corresponding to the query.
     *
     * @param query the query to search.
     * @return the result of the search.
     */
    @GetMapping("/users/_search/{query}")
    public List<UserDTO> search(@PathVariable("query") String query) {
        return StreamSupport.stream(userSearchRepository.search(query).spliterator(), false).map(UserDTO::new).toList();
    }

    @PatchMapping(value = "/users/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UserDTO> updateUser(@PathVariable(value = "id", required = false) final String id, @RequestBody UserDTO userDTO) {
        log.debug("REST request to partial update User partially : {}, {}", id, userDTO);
        if (userDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", "User", "idnull");
        }
        User existingUser = userService.findOneById(id).orElseThrow();
        Optional<UserDTO> result = userService.update(existingUser, userDTO);
        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, "User", userDTO.getId()));
    }

    @GetMapping("users/{id}")
    public UserDTO getUser(@PathVariable String id) {
        log.debug("REST request to get user {}", id);
        return userService.findOneById(id).map(UserDTO::new).orElseThrow();
    }
}
