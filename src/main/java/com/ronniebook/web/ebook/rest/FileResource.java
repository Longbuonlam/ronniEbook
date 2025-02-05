package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.service.FileService;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class FileResource {

    private final Logger log = LoggerFactory.getLogger(FileResource.class);
    private final FileService fileService;

    public FileResource(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/file/upload-file")
    public ResponseEntity<?> uploadFile(@RequestParam String folderId, @RequestParam MultipartFile file) throws IOException {
        log.debug("Rest request to upload file {}", file.getOriginalFilename());
        fileService.uploadFile(folderId, file);
        return ResponseEntity.ok("File uploaded successfully");
    }

    @DeleteMapping("/file/delete-file")
    public ResponseEntity<?> deleteFile(@RequestParam String fileId) {
        log.debug("Rest request to delete file from storage, id {}", fileId);
        fileService.deleteFile(fileId);
        return ResponseEntity.noContent().build();
    }
}
