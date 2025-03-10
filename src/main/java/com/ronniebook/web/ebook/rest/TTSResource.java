package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.LanguageCode;
import com.ronniebook.web.ebook.service.TTSService;
import com.ronniebook.web.ebook.tts.SpeechLanguage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private final Logger log = LoggerFactory.getLogger(TTSResource.class);

    public TTSResource(TTSService ttsService) {
        this.ttsService = ttsService;
    }

    @GetMapping(value = "/synthesize", produces = "audio/wav")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestParam String text) {
        byte[] audioData = ttsService.synthesizeSpeech(text, String.valueOf(SpeechLanguage.ENGLISH));

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "audio/wav");

        return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
    }

    @GetMapping(value = "/text-to-speech/VN", produces = "audio/wav")
    public ResponseEntity<byte[]> getVnAudio(@RequestParam String text) {
        byte[] vnAudioData = ttsService.getVnAudio(text);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "audio/wav");

        return new ResponseEntity<>(vnAudioData, headers, HttpStatus.OK);
    }

    @GetMapping(value = "/text-to-speech", produces = "audio/wav")
    public ResponseEntity<byte[]> getAudio(@RequestParam String content, @RequestParam LanguageCode nation) {
        log.debug("Rest request to get data of text-to-speech");
        byte[] audioData;
        audioData = ttsService.streamSpeech(content, nation);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "audio/wav");

        return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
    }
}
