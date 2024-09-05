package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.service.TTSService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TTSResource {

    private final TTSService ttsService;

    public TTSResource(TTSService ttsService) {
        this.ttsService = ttsService;
    }

    @GetMapping(value = "/synthesize", produces = "audio/wav")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestParam String text) {
        byte[] audioData = ttsService.synthesizeSpeech(text);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "audio/wav");

        return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
    }
}
