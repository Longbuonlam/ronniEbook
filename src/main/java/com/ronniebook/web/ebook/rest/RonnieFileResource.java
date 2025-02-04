package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.service.GoogleDriveService;
import com.ronniebook.web.ebook.service.RonnieFileService;
import java.io.File;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class RonnieFileResource {

    private final Logger log = LoggerFactory.getLogger(RonnieFileResource.class);
    private final RonnieFileService ronnieFileService;
    private final GoogleDriveService googleDriveService;

    public RonnieFileResource(RonnieFileService ronnieFileService, GoogleDriveService googleDriveService) {
        this.ronnieFileService = ronnieFileService;
        this.googleDriveService = googleDriveService;
    }
    //    @PostMapping("/ronnie-file/save")
    //    public ResponseEntity<?> saveFile(@RequestParam MultipartFile file) {
    //        log.debug("Rest request to save file");
    //        String fileName = file.getOriginalFilename();
    //        googleDriveService.uploadFile()
    //    }
}
