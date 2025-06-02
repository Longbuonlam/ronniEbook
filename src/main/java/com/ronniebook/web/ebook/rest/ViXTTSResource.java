package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.dto.TextToSpeechRequest;
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

    @PostMapping(value = "/TTS/process-audio", produces = "audio/wav")
    public ResponseEntity<byte[]> getAudio(@RequestBody TextToSpeechRequest request) {
        log.debug("Rest request to get data of text-to-speech");

        UserRecordDTO dto = new UserRecordDTO();
        dto.setPath(request.getPath());
        dto.setRecordUrl(request.getRecordUrl());
        dto.setOriginalName(request.getOriginalName());
        dto.setSize(request.getSize());

        byte[] audioData;
        audioData = viXTTSService.streamAudio(request.getContent(), request.getLanguage(), dto);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "audio/wav");

        return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
    }
}
