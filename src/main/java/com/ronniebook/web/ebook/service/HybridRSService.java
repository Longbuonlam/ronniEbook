package com.ronniebook.web.ebook.service;

import com.ronniebook.web.domain.User;
import com.ronniebook.web.ebook.domain.dto.RSResponseDTO;
import com.ronniebook.web.ebook.domain.dto.RecommendBookDTO;
import com.ronniebook.web.ebook.domain.dto.SimilarBookDTO;
import com.ronniebook.web.repository.UserRepository;
import com.ronniebook.web.security.SecurityUtils;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class HybridRSService {

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final Logger log = LoggerFactory.getLogger(HybridRSService.class);
    private static final String API_RECOMMEND_URL = "http://127.0.0.1:8000/recommend/";
    private static final String API_SIMILAR_BOOK_URL = "http://127.0.0.1:8000/recommend/book/";

    public HybridRSService(RestTemplate restTemplate, UserRepository userRepository) {
        this.restTemplate = restTemplate;
        this.userRepository = userRepository;
    }

    public RSResponseDTO getRecommendations(String userId) {
        String url = API_RECOMMEND_URL + userId;
        try {
            ResponseEntity<RSResponseDTO> response = restTemplate.getForEntity(url, RSResponseDTO.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Failed to fetch recommendations: {}", e.getMessage(), e);
            return null;
        }
    }

    public SimilarBookDTO getSimilarBookRecommendation(String bookId) {
        String url = API_SIMILAR_BOOK_URL + bookId;
        try {
            ResponseEntity<SimilarBookDTO> response = restTemplate.getForEntity(url, SimilarBookDTO.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Failed to fetch similar book recommendations: {}", e.getMessage(), e);
            return null;
        }
    }

    public List<String> getRecommendBookIDs() {
        //        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow();
        //        User user = userRepository.findOneByLogin(userLogin).orElseThrow();
        RSResponseDTO response = getRecommendations("4b22e638-3e13-43f9-b737-c5bbd8c97616");
        if (response != null && response.getRecommendations() != null) {
            return response.getRecommendations().stream().map(RecommendBookDTO::getBook_id).collect(Collectors.toList());
        } else {
            //            log.warn("No recommendations found for user: {}", user.getId());
            return Collections.emptyList();
        }
    }

    public List<String> getSimilarBookIDs(String bookId) {
        SimilarBookDTO similarBook = getSimilarBookRecommendation(bookId);
        return similarBook.getRecommendations();
    }
}
