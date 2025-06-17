package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.domain.dto.UserRecordDTO;
import java.io.IOException;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SSEService {

    private final Logger log = LoggerFactory.getLogger(SSEService.class);

    private final TextToSpeechService textToSpeechService;

    public SSEService(TextToSpeechService textToSpeechService) {
        this.textToSpeechService = textToSpeechService;
    }

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
                String audioUrl = textToSpeechService.generateAudioUrlForChunk(
                    chunk,
                    langCode,
                    normalize,
                    userRecord.getRecordUrl(),
                    userRecord
                );
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
                "https://thinhlpg-vixtts-demo.hf.space/file=/tmp/gradio/4075e7482e5c5086ae149be047f43a530b2d3dab/output.wav",
                ":"
            );

            for (String url : dummyUrls) {
                System.out.println("Sending SSE at:" + LocalTime.now());
                if (url != null && !url.equals(":")) {
                    emitter.send(SseEmitter.event().name("audio").data(url));
                    Thread.sleep(10000); // giả lập delay giữa các file
                } else {
                    emitter.send(SseEmitter.event().name("error").data("Failed to generate audio"));
                    emitter.complete();
                    return;
                }
            }

            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }
}
