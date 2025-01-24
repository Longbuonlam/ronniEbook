package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.service.GoogleDriveService;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GoogleDriveResource {

    private final Logger log = LoggerFactory.getLogger(GoogleDriveResource.class);
    private final GoogleDriveService googleDriveService;

    public GoogleDriveResource(GoogleDriveService googleDriveService) {
        this.googleDriveService = googleDriveService;
    }

    @PostMapping("/google-drive/create-folder")
    public ResponseEntity<?> createFolder(@RequestParam String folderName) throws IOException {
        String folderId = googleDriveService.createNewFolder(folderName);
        return ResponseEntity.ok("https://drive.google.com/drive/folders/" + folderId);
    }
}
