package com.ronniebook.web.ebook.service;

import com.ronniebook.web.domain.User;
import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.Rating;
import com.ronniebook.web.ebook.domain.dto.RSResponseDTO;
import com.ronniebook.web.ebook.domain.dto.RecommendBookDTO;
import com.ronniebook.web.ebook.domain.dto.SimilarBookDTO;
import com.ronniebook.web.ebook.repository.BookRepository;
import com.ronniebook.web.ebook.repository.RatingRepository;
import com.ronniebook.web.repository.UserRepository;
import com.ronniebook.web.security.SecurityUtils;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class HybridRSService {

    private final RestTemplate restTemplate;
    private final Logger log = LoggerFactory.getLogger(HybridRSService.class);
    private final String RECOMMEND_URL;
    private final String SIMILAR_BOOK_URL;
    private final String UPDATE_DATA_URL;

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;

    public HybridRSService(
        RestTemplate restTemplate,
        BookRepository bookRepository,
        UserRepository userRepository,
        RatingRepository ratingRepository,
        @Value("${ronniebook-other-services.recommend-url}") String recommendUrl,
        @Value("${ronniebook-other-services.similar-book-url}") String similarBookUrl,
        @Value("${ronniebook-other-services.update-data-url}") String updateDataUrl
    ) {
        this.restTemplate = restTemplate;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.ratingRepository = ratingRepository;
        this.RECOMMEND_URL = recommendUrl;
        this.SIMILAR_BOOK_URL = similarBookUrl;
        this.UPDATE_DATA_URL = updateDataUrl;
    }

    public RSResponseDTO getRecommendations(String userId) {
        String url = RECOMMEND_URL + userId;
        try {
            ResponseEntity<RSResponseDTO> response = restTemplate.getForEntity(url, RSResponseDTO.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Failed to fetch recommendations: {}", e.getMessage(), e);
            RSResponseDTO fallback = new RSResponseDTO();
            fallback.setRecommendations(Collections.emptyList());
            return fallback;
        }
    }

    public SimilarBookDTO getSimilarBookRecommendation(String bookId) {
        String url = SIMILAR_BOOK_URL + bookId;
        try {
            ResponseEntity<SimilarBookDTO> response = restTemplate.getForEntity(url, SimilarBookDTO.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Failed to fetch similar book recommendations: {}", e.getMessage(), e);
            SimilarBookDTO fallback = new SimilarBookDTO();
            fallback.setRecommendations(Collections.emptyList());
            return fallback;
        }
    }

    // TODO : un-commented code for production
    public List<String> getRecommendBookIDs() {
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow();
        User user = userRepository.findOneByLogin(userLogin).orElseThrow();
        RSResponseDTO response = getRecommendations(user.getId());
        if (response != null && response.getRecommendations() != null) {
            return response.getRecommendations().stream().map(RecommendBookDTO::getBook_id).collect(Collectors.toList());
        } else {
            log.warn("No recommendations found for user: {}", user.getId());
            return Collections.emptyList();
        }
    }

    public List<String> getSimilarBookIDs(String bookId) {
        SimilarBookDTO similarBook = getSimilarBookRecommendation(bookId);
        return similarBook.getRecommendations();
    }

    @Scheduled(cron = "0 59 23 * * *")
    public void dailyUpdateData() {
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = LocalDate.now(ZoneOffset.UTC).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Book> books = bookRepository.findByCreatedDateBetween(startOfDay, endOfDay);
        List<User> users = userRepository.findByCreatedDateBetween(startOfDay, endOfDay);
        List<Rating> ratings = ratingRepository.findByCreatedDateBetween(startOfDay, endOfDay);

        for (Rating rating : ratings) {
            User user = userRepository.findOneByLogin(rating.getUserId()).orElseThrow();
            rating.setUserId(user.getId());
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("books", DataConverter.convertBooks(books));
        payload.put("users", DataConverter.convertUsers(users));
        payload.put("ratings", DataConverter.convertRatings(ratings));

        log.info("Payload : {}", payload);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(UPDATE_DATA_URL, request, String.class);
            log.info("Sent daily data to recommendation system: {}", response.getBody());
        } catch (RestClientException e) {
            log.error("Failed to send daily data: {}", e.getMessage(), e);
        }
    }
}
