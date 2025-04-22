package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.domain.dto.UserRecordDTO;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class ViXTTSService {

    private final Logger log = LoggerFactory.getLogger(ViXTTSService.class);
    private final RestTemplate restTemplate;
    private static final String API_PROCESS_AUDIO_URL = "http://127.0.0.1:5000/process_audio";

    public ViXTTSService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Cacheable(value = "ronnie-tts", key = "#prompt + '_' + #language")
    public byte[] streamAudio(String prompt, LanguageCode language, UserRecordDTO userRecord) {
        log.debug("Request to save data to redis, key : {}", prompt + "_" + language);
        return switch (language) {
            case VIETNAMESE -> processAudio(prompt, "vi", true, userRecord);
            case JAPANESE -> processAudio(prompt, "ja", false, userRecord);
            default -> processAudio(prompt, "en", false, userRecord);
        };
    }

    public byte[] processAudio(String prompt, String language, Boolean normalizeViText, UserRecordDTO userRecord) {
        log.debug("Request to get audio file from ViXTTS");
        String url = getAudioUrl(prompt, language, normalizeViText, userRecord);
        if (url != null) {
            url = url.replace("\"", "");
            log.debug("Cleaned file URL: {}", url);
            return restTemplate.getForObject(url, byte[].class);
        } else {
            log.error("No URL received for audio file.");
            return new byte[0];
        }
    }

    private String getAudioUrl(String prompt, String language, Boolean normalizeViText, UserRecordDTO userRecord) {
        log.debug("Request to get audio file URL from ViXTTS");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String sanitizedPrompt = prompt.replace("\n", " ").replace("\r", " ").replace("_", " ");

            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("prompt", sanitizedPrompt);
            requestMap.put("language", language);
            requestMap.put("normalize_vi_text", normalizeViText);
            requestMap.put("user_record", userRecord);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestMap, headers);

            ResponseEntity<String> response = restTemplate.exchange(API_PROCESS_AUDIO_URL, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String fileUrl = response.getBody();
                log.debug("Received audio file URL: {}", fileUrl);
                return fileUrl;
            } else {
                log.error("Failed to get file URL, status: {}", response.getStatusCode());
            }
        } catch (RestClientException e) {
            log.error("Error while calling ViXTTS service: {}", e.getMessage(), e);
        }

        return null;
    }
}
