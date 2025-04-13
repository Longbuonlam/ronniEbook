package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.service.UserSpeechService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserSpeechResource {

    private final Logger log = LoggerFactory.getLogger(UserSpeechResource.class);
    private final UserSpeechService userSpeechService;

    public UserSpeechResource(UserSpeechService userSpeechService) {
        this.userSpeechService = userSpeechService;
    }
}
