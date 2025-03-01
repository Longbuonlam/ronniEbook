package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.RonnieFile;
import com.ronniebook.web.ebook.domain.dto.ReorderFileRequest;
import com.ronniebook.web.ebook.domain.dto.RonnieFileDTO;
import com.ronniebook.web.ebook.service.FileService;
import com.ronniebook.web.security.AuthoritiesConstants;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class FileResource {

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final Logger log = LoggerFactory.getLogger(FileResource.class);
    private final FileService fileService;

    public FileResource(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/file/upload-file")
    @PreAuthorize("hasRole('" + AuthoritiesConstants.ADMIN + "')")
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
        @ParameterObject Pageable pageable,
        @RequestParam String chapterStorageId,
        @RequestParam(required = false) String searchText
    ) {
        log.debug("Rest request to a page of file");
        Page<RonnieFileDTO> page = fileService.findAll(pageable, chapterStorageId, searchText);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @GetMapping("/files/{chapterStorageId}")
    public ResponseEntity<String> getHTMLContent(@PathVariable String chapterStorageId) {
        log.debug("Rest request to get file have chapter storage id {}", chapterStorageId);
        String htmlContent = "";
        List<RonnieFile> files = fileService.findAllByStorageId(chapterStorageId);
        if (files != null) {
            // Sort files by order
            files.sort(Comparator.comparing(RonnieFile::getOrder));

            htmlContent = files.stream().map(RonnieFile::getContent).collect(Collectors.joining());
        }
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(htmlContent);
    }

    @PatchMapping(value = "/files/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasRole('" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<RonnieFile> updateFile(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody RonnieFile file
    ) throws URISyntaxException {
        log.debug("REST request to partial update File partially : {}, {}", id, file);
        if (file.getId() == null) {
            throw new BadRequestAlertException("Invalid id", "file", "idnull");
        }
        RonnieFile existingFile = fileService.findOne(id);
        if (existingFile == null) {
            throw new BadRequestAlertException("Entity not found", "file", "idnotfound");
        }

        Optional<RonnieFile> result = fileService.update(existingFile, file);
        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, "file", file.getId()));
    }

    @PatchMapping(value = "/files/change-order", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasRole('" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<?> changeOrder(@RequestBody ReorderFileRequest request) {
        log.debug("Rest request to change the order of files");
        fileService.changeFileOrder(request.getChapterStorageId(), request.getNewOrder());
        return ResponseEntity.ok("Successfully change the order of files");
    }
}
