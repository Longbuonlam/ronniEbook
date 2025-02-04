package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.RonnieFile;
import com.ronniebook.web.ebook.repository.RonnieFileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class RonnieFileService {

    private final Logger log = LoggerFactory.getLogger(RonnieFileService.class);
    private final RonnieFileRepository ronnieFileRepository;

    public RonnieFileService(RonnieFileRepository ronnieFileRepository) {
        this.ronnieFileRepository = ronnieFileRepository;
    }

    public void saveFile(RonnieFile file) {
        log.debug("Request to save file {}", file);
        ronnieFileRepository.save(file);
    }
}
