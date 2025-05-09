package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.ElasticsearchBookDocument;
import com.ronniebook.web.ebook.service.ElasticsearchService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ElasticsearchBookDocumentResource {

    private final Logger log = LoggerFactory.getLogger(ElasticsearchBookDocumentResource.class);
    private final ElasticsearchService elasticsearchService;

    public ElasticsearchBookDocumentResource(ElasticsearchService elasticsearchService) {
        this.elasticsearchService = elasticsearchService;
    }

    @PostMapping("/elasticsearch/book-document")
    public ResponseEntity<String> createDocument(
        @RequestParam String bookId,
        @RequestParam String chapterId,
        @RequestParam String content
    ) {
        log.debug("Rest request to save a book document to elasticsearch");
        ElasticsearchBookDocument document = new ElasticsearchBookDocument();
        document.setBookId(bookId);
        document.setChapterId(chapterId);
        document.setContent(content);
        elasticsearchService.saveBookDocument(document);
        return ResponseEntity.ok().body("Successfully save book document to elasticsearch");
    }

    @GetMapping("/elasticsearch/book-document")
    public ResponseEntity<?> getBookDocument(@RequestParam String content) {
        log.debug("Rest request to get book document");
        List<ElasticsearchBookDocument> list = elasticsearchService.findBookDocumentsByContent(content);
        return ResponseEntity.ok().body(list);
    }

    @DeleteMapping("/elasticsearch/book-document/{id}")
    public ResponseEntity<Void> deleteBookDocument(@PathVariable String id) {
        log.debug("Rest request to delete book document");
        elasticsearchService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
