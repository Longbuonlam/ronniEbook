package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.*;
import com.ronniebook.web.ebook.repository.ChapterRepository;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.util.Utils;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ChapterService {

    private final Logger log = LoggerFactory.getLogger(ChapterService.class);
    private final ChapterRepository chapterRepository;
    private final UserService userService;
    private final RonnieFileService ronnieFileService;

    public ChapterService(ChapterRepository chapterRepository, UserService userService, RonnieFileService ronnieFileService) {
        this.chapterRepository = chapterRepository;
        this.userService = userService;
        this.ronnieFileService = ronnieFileService;
    }

    /**
     * Save a Chapter.
     *
     * @param chapter the entity to save.
     * @return the persisted entity.
     */
    public Chapter save(Chapter chapter) {
        log.debug("Request to save chapter : {}", chapter);
        return chapterRepository.save(chapter);
    }

    /**
     * Update a chapter.
     *
     * @param existingChapter the entity to save.
     * @return the persisted entity.
     */
    public Optional<Chapter> update(Chapter existingChapter, Chapter newChapter) {
        log.debug("Request to update Chapter : {}", newChapter);
        if (!userService.isAdmin()) {
            throw new BadRequestAlertException("", "", "Only admin can update chapter");
        }
        if (newChapter.getChapterName() != null) {
            existingChapter.setChapterName(newChapter.getChapterName());
        }
        if (newChapter.getChapterStatus() != null) {
            existingChapter.setChapterStatus(newChapter.getChapterStatus());
        }
        if (newChapter.getLanguage() != null) {
            existingChapter.setLanguage(newChapter.getLanguage());
        }
        if (newChapter.getNumber() != null) {
            existingChapter.setNumber(newChapter.getNumber());
        }
        return Optional.of(chapterRepository.save(existingChapter));
    }

    /**
     * Get all the chapters.
     *
     * @param pageable   the pagination information.
     * @param bookId     id of Book entity
     * @param searchText String
     * @return the list of entities.
     */
    public Page<Chapter> findAll(Pageable pageable, String bookId, String searchText) {
        log.debug("Request to get all Chapters");

        // Modify pageable
        if (pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "number");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }

        // Find chapter
        if (searchText == null) {
            return chapterRepository.findByBookId(pageable, bookId);
        }
        return chapterRepository.findByBookIdAndChapterNameContains(pageable, bookId, searchText);
    }

    /**
     * Get one chapter by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Optional<Chapter> findOne(String id) {
        log.debug("Request to get Chapter : {}", id);
        return chapterRepository.findByChapterId(id);
    }

    /**
     * Get all chapter by bookId.
     *
     * @param bookId the id of the Book entity.
     * @return the entity.
     */
    public List<Chapter> findAllByBookId(String bookId) {
        log.debug("Request to get all Chapter by BookId : {}", bookId);
        return chapterRepository.findAllByBookId(bookId);
    }

    /**
     * Delete the chapter by id.
     *
     * @param chapter the Chapter entity.
     */
    public void delete(Chapter chapter) {
        log.debug("Request to delete Chapter: {}", chapter.getId());
        //Soft delete
        chapter.setDeleted(true);
        chapterRepository.save(chapter);
    }

    @Async
    public void upsertChapter(Chapter chapter, Book book) {
        log.debug("Create new thread to upsert chapter {}", chapter);
        String storageId = createStorage(chapter.getChapterName(), book.getStorageId());
        chapterRepository
            .findById(chapter.getId())
            .ifPresent(c -> {
                c.setStorageId(storageId);
                chapterRepository.save(c);
            });
    }

    private String createStorage(String chapterName, String bookStorageId) {
        try {
            return ronnieFileService.createSubFolder(chapterName, bookStorageId);
        } catch (IOException e) {
            throw new BadRequestAlertException("", "", "Error in create storage for chapter");
        }
    }

    public Map<Integer, String> findByBookId(String bookId) {
        List<Chapter> list = findAllByBookId(bookId);
        Map<Integer, String> map = new HashMap<>();
        for (Chapter chapter : list) {
            map.put(chapter.getNumber(), chapter.getStorageId());
        }
        return map;
    }

    public Chapter findByStorageId(String storageId) {
        return chapterRepository.findByStorageIdAndIsDeletedFalse(storageId);
    }
}
