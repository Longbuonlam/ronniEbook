package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.ReadingProgress;
import com.ronniebook.web.ebook.domain.dto.ReadingProgressDTO;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.ebook.repository.ReadingProgressRepository;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ReadingProgressService {

    private final Logger log = LoggerFactory.getLogger(ReadingProgressService.class);
    private final ReadingProgressRepository readingProgressRepository;
    private final BookRepository bookRepository;
    private final HistoryService historyService;

    public ReadingProgressService(
        ReadingProgressRepository readingProgressRepository,
        BookRepository bookRepository,
        HistoryService historyService
    ) {
        this.readingProgressRepository = readingProgressRepository;
        this.bookRepository = bookRepository;
        this.historyService = historyService;
    }

    public ReadingProgress save(String bookId, String chapterStorageId) {
        log.debug("Request to save reading progress");
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        ReadingProgress readingProgress = readingProgressRepository.findByUserIdAndBookId(userId, bookId);
        if (readingProgress == null) {
            ReadingProgress progress = new ReadingProgress();
            Set<String> finishChapterId = new HashSet<>();
            finishChapterId.add(chapterStorageId);
            progress.setUserId(userId);
            progress.setBookId(bookId);
            progress.setFinishedChapterStorageIds(finishChapterId);
            return readingProgressRepository.save(progress);
        }
        Set<String> finishChapters = readingProgress.getFinishedChapterStorageIds();
        finishChapters.add(chapterStorageId);

        return readingProgressRepository.save(readingProgress);
    }

    public Page<ReadingProgressDTO> findAllReadingProgressByUserId(Pageable pageable, String searchText) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        List<ReadingProgress> readingProgressList = readingProgressRepository.findByUserId(userId);
        Map<String, ReadingProgress> bookIdToProgress = readingProgressList
            .stream()
            .collect(Collectors.toMap(ReadingProgress::getBookId, rp -> rp));

        List<String> listBookIds = new ArrayList<>();
        for (ReadingProgress readingProgress : readingProgressList) {
            listBookIds.add(readingProgress.getBookId());
        }

        Page<Book> bookPage;
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "book_name");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }
        if (searchText == null) {
            bookPage = bookRepository.findAllWithBookIds(pageable, listBookIds);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            bookPage = bookRepository.findByTextWithBookIds(pageable, searchText, listBookIds);
        }

        Page<ReadingProgressDTO> result = bookPage.map(book -> {
            ReadingProgress progress = bookIdToProgress.get(book.getId());

            int finishedChapter = progress != null ? progress.getFinishedChapterStorageIds().size() : 0;

            return new ReadingProgressDTO(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getImageUrl(),
                book.getChapterCount(),
                finishedChapter
            );
        });

        return result;
    }

    public void delete(String bookId) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        log.debug("Request to delete reading progress, userId : {}, bookId : {}", userId, bookId);
        ReadingProgress readingProgress = readingProgressRepository.findByUserIdAndBookId(userId, bookId);
        readingProgressRepository.delete(readingProgress);
    }

    public Page<Book> findOtherBookByUserId(Pageable pageable, String searchText) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        List<ReadingProgress> readingProgressList = readingProgressRepository.findByUserId(userId);
        List<String> listBookIds = new ArrayList<>();
        for (ReadingProgress readingProgress : readingProgressList) {
            listBookIds.add(readingProgress.getBookId());
        }

        Page<Book> bookPage;
        if (pageable != null && pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "book_name");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        if (pageable == null) {
            throw new BadRequestAlertException("", "", "Pageable is null");
        }
        if (searchText == null) {
            bookPage = bookRepository.findAllExceptBookIds(pageable, listBookIds);
        } else {
            // Handle special characters
            searchText = Pattern.quote(searchText);
            bookPage = bookRepository.findByTextExceptBookIds(pageable, searchText, listBookIds);
        }
        return bookPage;
    }

    public Integer getProcess(String bookId) {
        log.debug("Request to get process of book {}", bookId);
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        ReadingProgress readingProgress = readingProgressRepository.findByUserIdAndBookId(userId, bookId);
        if (readingProgress == null) {
            return 0;
        }
        Book book = bookRepository.findById(bookId).orElseThrow();

        int finishedChapter = readingProgress.getFinishedChapterStorageIds().size();
        int totalChapter = book.getChapterCount();

        if (totalChapter == 0) {
            return 0;
        }
        return (finishedChapter * 100) / totalChapter;
    }

    public Boolean hadProcessSaved(String bookId, String chapterStorageId) {
        log.debug("Request to check if process had been saved : book id {}, chapter storage id {}", bookId, chapterStorageId);
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        ReadingProgress readingProgress = readingProgressRepository.findByUserIdAndBookId(userId, bookId);
        if (readingProgress == null) {
            return false;
        }
        Set<String> finishedChapters = readingProgress.getFinishedChapterStorageIds();
        if (finishedChapters == null) {
            return false;
        }
        return finishedChapters.contains(chapterStorageId);
    }

    public void checkAndSaveToHistory(String bookId) {
        int progress = getProcess(bookId);
        if (progress == 100) {
            historyService.save(bookId);
        }
    }

    public Set<String> getAllFinishedChapters(String bookId) {
        log.debug("Request to get all finished chapters of book {}", bookId);
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        ReadingProgress readingProgress = readingProgressRepository.findByUserIdAndBookId(userId, bookId);
        if (readingProgress == null) {
            return new HashSet<>();
        }
        return readingProgress.getFinishedChapterStorageIds();
    }
}
