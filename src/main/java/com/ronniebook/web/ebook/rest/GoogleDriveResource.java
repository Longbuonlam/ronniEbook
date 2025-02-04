package com.ronniebook.web.ebook.rest;

import com.google.api.services.drive.model.File;
import com.ronniebook.web.ebook.service.GoogleDriveService;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        log.debug("Request to create folder name {}", folderName);
        String folderId = googleDriveService.createNewFolder(folderName);
        return ResponseEntity.ok("https://drive.google.com/drive/folders/" + folderId);
    }

    @PostMapping("/google-drive/upload-file")
    public ResponseEntity<?> uploadFileToGGDrive(@RequestParam String folderId, @RequestParam MultipartFile file) throws IOException {
        log.debug("Request to upload file");
        File file1 = googleDriveService.uploadFile(folderId, file.getOriginalFilename(), file);
        return ResponseEntity.ok("upload file successfully");
    }

    @DeleteMapping("/google-drive/delete-folder")
    public ResponseEntity<?> deleteFolder(@RequestParam String folderId) {
        googleDriveService.deleteFile(folderId);
        return ResponseEntity.noContent().build();
    }
}
