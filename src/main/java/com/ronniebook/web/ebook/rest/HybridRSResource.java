package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.dto.RSResponseDTO;
import com.ronniebook.web.ebook.domain.dto.SimilarBookDTO;
import com.ronniebook.web.ebook.service.HybridRSService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HybridRSResource {

    private final Logger log = LoggerFactory.getLogger(HybridRSResource.class);
    private final HybridRSService hybridRSService;

    public HybridRSResource(HybridRSService hybridRSService) {
        this.hybridRSService = hybridRSService;
    }

    @GetMapping("/recommend-book")
    public ResponseEntity<RSResponseDTO> getRecommendBooks(@RequestParam String userId) {
        RSResponseDTO result = hybridRSService.getRecommendations(userId);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }

    @GetMapping("/get-recommend-book-ids")
    public ResponseEntity<List<String>> getBookIds() {
        List<String> result = hybridRSService.getRecommendBookIDs();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/similar-book")
    public ResponseEntity<SimilarBookDTO> getSimilarBook(@RequestParam String bookId) {
        SimilarBookDTO result = hybridRSService.getSimilarBookRecommendation(bookId);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }
}
