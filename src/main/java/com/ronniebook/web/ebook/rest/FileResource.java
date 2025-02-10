package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.RonnieFile;
import com.ronniebook.web.ebook.domain.dto.RonnieFileDTO;
import com.ronniebook.web.ebook.service.FileService;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

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

    @GetMapping("/files")
    public ResponseEntity<Page<RonnieFileDTO>> getFiles(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam String chapterStorageId,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("Rest request to a page of file");
        Page<RonnieFileDTO> page = fileService.findAll(pageable, chapterStorageId, searchText);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @GetMapping("/files/{id}")
    public RonnieFile getFileDetail(@PathVariable String id) {
        log.debug("Rest request to get file {}", id);
        return fileService.findOne(id);
    }
}
