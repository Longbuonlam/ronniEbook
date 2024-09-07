package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.*;
import com.ronniebook.web.ebook.repository.ChapterRepository;
import com.ronniebook.web.repository.UserRepository;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.util.Utils;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ChapterService {

    private final Logger log = LoggerFactory.getLogger(ChapterService.class);
    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;

    private final UserService userService;

    public ChapterService(UserRepository userRepository, ChapterRepository chapterRepository, UserService userService) {
        this.userRepository = userRepository;
        this.chapterRepository = chapterRepository;
        this.userService = userService;
    }

    /**
     * Save a Chapter.
     *
     * @param chapter the entity to save.
     * @return the persisted entity.
     */
    public Chapter save(Chapter chapter) {
        log.debug("Request to save chapter : {}", chapter);
        String loginId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        String userId = userRepository.findOneByLogin(loginId).orElseThrow().getId();
        chapter.setCreateBy(userId);
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
        return Optional.of(chapterRepository.save(existingChapter));
    }

    /**
     * Get all the chapters.
     *
     * @param pageable   the pagination information.
     * @param book       Book entity
     * @param searchText String
     * @return the list of entities.
     */
    public Page<Chapter> findAll(Pageable pageable, Book book, String searchText) {
        log.debug("Request to get all Chapters");

        // Modify pageable
        if (pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.DESC, "createDate");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }

        // Find chapter
        if (book == null) {
            return chapterRepository.findAll(pageable);
        }
        if (searchText == null) {
            return chapterRepository.findByBookId(pageable, book.getId());
        }
        return chapterRepository.findByBookIdAndChapterNameContains(pageable, book.getId(), searchText);
    }

    /**
     * Get one chapter by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Optional<Chapter> findOne(String id) {
        log.debug("Request to get N0Document : {}", id);
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

    public Chapter uploadChapter(String fileVersion, LanguageCode bookLanguage, Book book, MultipartFile file) throws IOException {
        String bookId = book.getId();

        Chapter chapter = new Chapter();

        String fileName = java.util.UUID.randomUUID().toString();
        String fileExt = Utils.getFileExtension(file.getOriginalFilename());
        if (fileExt != null) {
            fileName = fileName + "." + fileExt;
        }

        chapter
            .chapterName(file.getOriginalFilename())
            .language(bookLanguage == null ? book.getLanguage() : bookLanguage)
            .setChapterStatus(ChapterStatus.NEW);

        chapter.setBookId(bookId);

        //        String filePath = fileStorage.storeFile(file.getInputStream(), Utils.joinPath(bookId, fileName));

        chapter.addDocumentFile(
            new DocumentFile()
                //                .filePath(filePath)
                .fileVersion(1)
                .fileType(ChapterStatus.UPLOAD_FINISH)
                .createdDate(Instant.now())
                .createdBy(SecurityUtils.getCurrentUserLogin().orElseThrow())
        );

        return save(chapter);
    }
}
