package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.domain.dto.UserRecordDTO;
import java.io.IOException;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class ViXTTSService {

    private final Logger log = LoggerFactory.getLogger(ViXTTSService.class);
    private final RestTemplate restTemplate;
    private final String PROCESS_AUDIO_URL;

    public ViXTTSService(RestTemplate restTemplate, @Value("${ronniebook-other-services.process_audio_url}") String processAudioUrl) {
        this.restTemplate = restTemplate;
        this.PROCESS_AUDIO_URL = processAudioUrl;
    }

    @Cacheable(value = "ronnie-tts", key = "#prompt + '_' + #language + '_' + #recordUrl")
    public byte[] streamAudio(String prompt, LanguageCode language, String recordUrl, UserRecordDTO userRecord) {
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

            //            String sanitizedPrompt = prompt.replace("\n", " ").replace("\r", " ").replace("_", " ");
            //            String shortenPrompt = get30Sentences(sanitizedPrompt);

            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("prompt", prompt);
            requestMap.put("language", language);
            requestMap.put("normalize_vi_text", normalizeViText);
            requestMap.put("user_record", userRecord);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestMap, headers);

            ResponseEntity<String> response = restTemplate.exchange(PROCESS_AUDIO_URL, HttpMethod.POST, requestEntity, String.class);

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

    private String get30Sentences(String text) {
        String[] sentences = text.split("(?<=[.!?])\\s+");
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < Math.min(sentences.length, 30); i++) {
            if (i > 0) result.append(" ");
            result.append(sentences[i].trim());
        }

        return result.toString();
    }

    /**
     *
     * New code to process with SSE.
     *
     */

    private List<String> splitTextBySentences(String text, int sentencesPerChunk) {
        String[] sentences = text.split("(?<=[.!?])\\s+");
        List<String> chunks = new ArrayList<>();
        StringBuilder currentChunk = new StringBuilder();

        int count = 0;
        for (String sentence : sentences) {
            if (count == sentencesPerChunk) {
                chunks.add(currentChunk.toString().trim());
                currentChunk = new StringBuilder();
                count = 0;
            }
            currentChunk.append(sentence.trim()).append(" ");
            count++;
        }

        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }

        return chunks;
    }

    @Cacheable(value = "ronnie-tts", key = "#chunk + '_' + #language + '_' + #recordUrl")
    private String generateAudioUrlForChunk(
        String chunk,
        String language,
        boolean normalizeViText,
        String recordUrl,
        UserRecordDTO userRecord
    ) {
        String url = getAudioUrl(chunk, language, normalizeViText, userRecord);
        if (url != null) {
            url = url.replace("\"", "");
        }
        return url;
    }

    public void processTextToSpeechWithSSE(String fullText, LanguageCode language, UserRecordDTO userRecord, SseEmitter emitter) {
        String langCode =
            switch (language) {
                case VIETNAMESE -> "vi";
                case JAPANESE -> "ja";
                default -> "en";
            };
        boolean normalize = (language == LanguageCode.VIETNAMESE);

        String sanitizedText = fullText.replace("\n", " ").replace("\r", " ").replace("_", " ");
        List<String> chunks = splitTextBySentences(sanitizedText, 30);
        log.info("Split text into {} chunks", chunks.size());

        for (String chunk : chunks) {
            try {
                String audioUrl = generateAudioUrlForChunk(chunk, langCode, normalize, userRecord.getRecordUrl(), userRecord);
                if (audioUrl != null && !audioUrl.equals(":")) {
                    emitter.send(SseEmitter.event().name("audio").data(audioUrl));
                } else {
                    emitter.send(SseEmitter.event().name("error").data("Failed to generate audio"));
                    emitter.complete();
                    return;
                }
            } catch (IOException e) {
                log.error("Error sending SSE data", e);
                emitter.completeWithError(e);
                return;
            }
        }

        emitter.complete();
    }

    public void testSendDummyAudioUrls(String fullText, LanguageCode language, UserRecordDTO userRecord, SseEmitter emitter) {
        try {
            List<String> dummyUrls = List.of(
                "https://thinhlpg-vixtts-demo.hf.space/file=/tmp/gradio/9bd86f03d7271eac5ccedeabe4f75de9898f8a29/output.wav",
                "https://thinhlpg-vixtts-demo.hf.space/file=/tmp/gradio/e1d7f0e6356341b8a0cfd85262155e4c9a68e9b4/output.wav",
                "https://thinhlpg-vixtts-demo.hf.space/file=/tmp/gradio/4075e7482e5c5086ae149be047f43a530b2d3dab/output.wav"
            );

            for (String url : dummyUrls) {
                System.out.println("Sending SSE at:" + LocalTime.now());
                emitter.send(SseEmitter.event().name("audio").data(url));
                Thread.sleep(10000); // giả lập delay giữa các file
            }

            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }
}
