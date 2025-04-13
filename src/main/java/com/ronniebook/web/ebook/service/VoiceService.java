package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.Voice;
import com.ronniebook.web.ebook.repository.VoiceRepository;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class VoiceService {

    private final Logger log = LoggerFactory.getLogger(VoiceService.class);
    private final VoiceRepository voiceRepository;
    private final RonnieFileService ronnieFileService;

    public VoiceService(VoiceRepository voiceRepository, RonnieFileService ronnieFileService) {
        this.voiceRepository = voiceRepository;
        this.ronnieFileService = ronnieFileService;
    }

    public Voice createVoiceStorage(Book book) {
        try {
            log.debug("request to create voice folder");
            String storageId = ronnieFileService.createVoiceFolder(book.getBookName());
            Voice voice = new Voice(book.getBookName(), book.getId(), storageId);
            return voiceRepository.save(voice);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteVoiceStorage(Voice voice) {
        log.debug("request to delete voice storage, id {}", voice.getId());
        String storageId = voice.getStorageId();
        ronnieFileService.deleteFile(storageId);
        voiceRepository.delete(voice);
    }

    public Voice findOneByBookId(String bookId) {
        log.debug("request to find voice storage of book id {}", bookId);
        return voiceRepository.findByBookId(bookId);
    }

    public Voice findOne(String id) {
        return voiceRepository.findById(id).orElseThrow();
    }
}
