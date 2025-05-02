package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Chapter;
import com.ronniebook.web.ebook.domain.ElasticsearchBookDocument;
import com.ronniebook.web.ebook.domain.RonnieFile;
import com.ronniebook.web.ebook.repository.ElasticsearchBookDocumentRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class ElasticsearchService {

    private final Logger log = LoggerFactory.getLogger(ElasticsearchService.class);
    private final ElasticsearchBookDocumentRepository elasticsearchBookDocumentRepository;
    private final ChapterService chapterService;

    public ElasticsearchService(ElasticsearchBookDocumentRepository elasticsearchBookDocumentRepository, ChapterService chapterService) {
        this.elasticsearchBookDocumentRepository = elasticsearchBookDocumentRepository;
        this.chapterService = chapterService;
    }

    public void saveBookDocument(ElasticsearchBookDocument bookDocument) {
        log.debug("Request to save book document to elastic search : {}", bookDocument);
        elasticsearchBookDocumentRepository.save(bookDocument);
    }

    public List<ElasticsearchBookDocument> findBookDocumentsByContent(String searchText) {
        log.debug("Request to find book document by content : {}", searchText);
        return elasticsearchBookDocumentRepository.findByContentContaining(searchText);
    }

    public void deleteDocument(String id) {
        log.debug("Request to delete book document");
        ElasticsearchBookDocument bookDocument = elasticsearchBookDocumentRepository.findById(id).orElseThrow();
        elasticsearchBookDocumentRepository.delete(bookDocument);
    }

    @Async
    public void postData(RonnieFile file) {
        log.debug("Request to post data to elasticsearch");
        Chapter chapter = chapterService.findByStorageId(file.getChapterStorageId());

        ElasticsearchBookDocument bookDocument = new ElasticsearchBookDocument();
        bookDocument.setContent(file.getRawContent());
        bookDocument.setChapterId(chapter.getId());
        bookDocument.setBookId(chapter.getBookId());
        elasticsearchBookDocumentRepository.save(bookDocument);
    }
}
