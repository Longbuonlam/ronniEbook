package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.Voice;
import com.ronniebook.web.ebook.service.BookService;
import com.ronniebook.web.ebook.service.VoiceService;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class VoiceResource {

    private final Logger log = LoggerFactory.getLogger(VoiceResource.class);
    private final VoiceService voiceService;
    private final BookService bookService;

    public VoiceResource(VoiceService voiceService, BookService bookService) {
        this.voiceService = voiceService;
        this.bookService = bookService;
    }

    @PostMapping("/voice/create-voice-folder")
    public ResponseEntity<?> createVoiceFolder(@RequestParam String bookId) throws IOException {
        log.debug("Rest request to create voice folder");
        Book book = bookService.findOne(bookId);
        Voice voice = voiceService.createVoiceStorage(book);
        return ResponseEntity.ok(voice.getStorageId());
    }

    @DeleteMapping("/voice/delete")
    public ResponseEntity<?> deleteVoiceFolder(@RequestParam String voiceId) {
        log.debug("Rest request to delete voice folder ");
        Voice voice = voiceService.findOne(voiceId);
        voiceService.deleteVoiceStorage(voice);
        return ResponseEntity.noContent().build();
    }
}
