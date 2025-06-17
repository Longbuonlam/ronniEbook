package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.dto.TextToSpeechRequest;
import com.ronniebook.web.ebook.domain.dto.UserRecordDTO;
import com.ronniebook.web.ebook.service.SSEService;
import com.ronniebook.web.ebook.service.TextToSpeechService;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api")
public class TextToSpeechResource {

    private final Logger log = LoggerFactory.getLogger(TextToSpeechResource.class);
    private final TextToSpeechService textToSpeechService;
    private final SSEService sseService;

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public TextToSpeechResource(TextToSpeechService textToSpeechService, SSEService sseService) {
        this.textToSpeechService = textToSpeechService;
        this.sseService = sseService;
    }

    @PostMapping(value = "/TTS/process-audio", produces = "audio/wav")
    public ResponseEntity<byte[]> getAudio(@RequestBody TextToSpeechRequest request) {
        log.debug("Rest request to get data of text-to-speech");

        UserRecordDTO dto = new UserRecordDTO();
        dto.setPath(request.getPath());
        dto.setRecordUrl(request.getRecordUrl());
        dto.setOriginalName(request.getOriginalName());
        dto.setSize(request.getSize());

        byte[] audioData;
        audioData = textToSpeechService.streamAudio(request.getContent(), request.getLanguage(), request.getRecordUrl(), dto);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "audio/wav");

        return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
    }

    @PostMapping("/TTS/init-stream")
    public ResponseEntity<String> streamAudio(@RequestBody TextToSpeechRequest request) {
        String streamId = UUID.randomUUID().toString();
        SseEmitter emitter = new SseEmitter(0L);
        emitters.put(streamId, emitter);

        // Callback để dọn dẹp
        emitter.onCompletion(() -> {
            emitters.remove(streamId);
            log.info("Emitter completed and removed: {}", streamId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(streamId);
            log.warn("Emitter timed out and removed: {}", streamId);
        });
        emitter.onError(e -> {
            emitters.remove(streamId);
            log.error("Emitter error and removed: {}", streamId, e);
        });

        UserRecordDTO dto = new UserRecordDTO();
        dto.setPath(request.getPath());
        dto.setRecordUrl(request.getRecordUrl());
        dto.setOriginalName(request.getOriginalName());
        dto.setSize(request.getSize());

        new Thread(() -> {
            //            sseService.processTextToSpeechWithSSE(
            //                request.getContent(),
            //                request.getLanguage(),
            //                dto,
            //                emitter
            //            );

            sseService.testSendDummyAudioUrls(request.getContent(), request.getLanguage(), dto, emitter);
        }).start();

        return ResponseEntity.ok(streamId);
    }

    @GetMapping(value = "/TTS/stream/{streamId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable String streamId) {
        SseEmitter emitter = emitters.get(streamId);
        if (emitter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid stream ID");
        }
        return emitter;
    }
}
