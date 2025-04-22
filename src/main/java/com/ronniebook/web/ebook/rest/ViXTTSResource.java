package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.domain.dto.UserRecordDTO;
import com.ronniebook.web.ebook.service.ViXTTSService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ViXTTSResource {

    private final Logger log = LoggerFactory.getLogger(ViXTTSResource.class);
    private final ViXTTSService viXTTSService;

    public ViXTTSResource(ViXTTSService viXTTSService) {
        this.viXTTSService = viXTTSService;
    }

    @GetMapping(value = "/TTS/process-audio", produces = "audio/wav")
    public ResponseEntity<byte[]> getAudio(
        @RequestParam String content,
        @RequestParam LanguageCode language,
        @RequestParam String path,
        @RequestParam String recordUrl,
        @RequestParam String originalName,
        @RequestParam Long size
    ) {
        log.debug("Rest request to get data of text-to-speech");

        UserRecordDTO dto = new UserRecordDTO();
        dto.setPath(path);
        dto.setRecordUrl(recordUrl);
        dto.setOriginalName(originalName);
        dto.setSize(size);

        byte[] audioData;
        audioData = viXTTSService.streamAudio(content, language, dto);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "audio/wav");

        return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
    }
}
