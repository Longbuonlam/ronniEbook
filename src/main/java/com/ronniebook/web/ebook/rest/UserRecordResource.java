package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.domain.UserRecord;
import com.ronniebook.web.ebook.domain.dto.UserRecordDTO;
import com.ronniebook.web.ebook.service.UserRecordService;
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
public class UserRecordResource {

    private final Logger log = LoggerFactory.getLogger(UserRecordResource.class);

    private final UserRecordService userRecordService;

    public UserRecordResource(UserRecordService userRecordService) {
        this.userRecordService = userRecordService;
    }

    @PostMapping("/user-record/upload")
    public ResponseEntity<UserRecord> uploadUserRecord(@RequestParam("file") MultipartFile file) {
        log.debug("Rest request to upload user record");
        UserRecordDTO recordDTO = userRecordService.uploadRecord(file);
        UserRecord result = userRecordService.saveRecord(recordDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user-record")
    public ResponseEntity<Page<UserRecord>> getAllRecords(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        log.debug("Rest request to get a page of record");
        Page<UserRecord> page = userRecordService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @GetMapping("/user-record/{id}")
    public UserRecord getUserRecord(@PathVariable String id) {
        log.debug("REST request to get record : {}", id);
        return userRecordService.findOne(id);
    }

    @DeleteMapping("/user-record/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable String id) {
        log.debug("Rest request to delete record {}", id);
        userRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
