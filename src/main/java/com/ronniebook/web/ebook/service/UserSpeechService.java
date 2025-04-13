package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.Book;
import com.ronniebook.web.ebook.domain.UserSpeech;
import com.ronniebook.web.ebook.domain.Voice;
import com.ronniebook.web.ebook.repository.UserSpeechRepository;
import com.ronniebook.web.security.SecurityUtils;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserSpeechService {

    private final Logger log = LoggerFactory.getLogger(UserSpeechService.class);
    private final UserSpeechRepository userSpeechRepository;
    private final VoiceService voiceService;
    private final RonnieFileService ronnieFileService;

    public UserSpeechService(UserSpeechRepository userSpeechRepository, VoiceService voiceService, RonnieFileService ronnieFileService) {
        this.userSpeechRepository = userSpeechRepository;
        this.voiceService = voiceService;
        this.ronnieFileService = ronnieFileService;
    }

    private String createSpeechStorage(MultipartFile file, Book book) throws IOException {
        log.debug("Request to create new storage for user speech");
        Voice voice = voiceService.findOneByBookId(book.getId());
        if (voice == null) {
            Voice newVoice = voiceService.createVoiceStorage(book);
            return ronnieFileService.uploadUserVoice(newVoice.getStorageId(), file);
        }
        return ronnieFileService.uploadUserVoice(voice.getStorageId(), file);
    }

    public UserSpeech saveUserSpeech(String bookId) {
        log.debug("Request to save user speech of book id {}", bookId);
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow();
        String fileName = bookId + "_" + userLogin;
        UserSpeech userSpeech = new UserSpeech(fileName, userLogin, bookId);
        return userSpeechRepository.save(userSpeech);
    }

    @Async
    public void upsertUserSpeech(UserSpeech userSpeech, MultipartFile file, Book book) throws IOException {
        String storageId = createSpeechStorage(file, book);
        userSpeech.setStorageId(storageId);
        userSpeechRepository.save(userSpeech);
    }
}
