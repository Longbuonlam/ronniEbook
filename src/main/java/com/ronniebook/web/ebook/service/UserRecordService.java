package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.UserRecord;
import com.ronniebook.web.ebook.domain.dto.UserRecordDTO;
import com.ronniebook.web.ebook.repository.UserRecordRepository;
import com.ronniebook.web.security.SecurityUtils;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserRecordService {

    private final RestTemplate restTemplate;
    private final UserRecordRepository userRecordRepository;
    private final Logger log = LoggerFactory.getLogger(UserRecordService.class);

    public UserRecordService(RestTemplate restTemplate, UserRecordRepository userRecordRepository) {
        this.restTemplate = restTemplate;
        this.userRecordRepository = userRecordRepository;
    }

    public UserRecord saveRecord(UserRecordDTO recordDTO) {
        log.debug("Request to save user record {}", recordDTO);
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow();
        UserRecord userRecord = new UserRecord(
            userLogin,
            recordDTO.getRecordUrl(),
            recordDTO.getPath(),
            recordDTO.getOriginalName(),
            recordDTO.getSize()
        );
        return userRecordRepository.save(userRecord);
    }

    public UserRecordDTO uploadRecord(MultipartFile file) {
        log.debug("Request to upload record");
        try {
            // Convert MultipartFile to ByteArrayResource
            Resource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Build body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("files", resource);

            // Create request entity
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Send request
            String externalUrl = "https://thinhlpg-vixtts-demo.hf.space/upload";
            ResponseEntity<String> response = restTemplate.postForEntity(externalUrl, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String path = response.getBody().replace("[", "").replace("]", "").replace("\"", "").trim();

                UserRecordDTO dto = new UserRecordDTO();
                dto.setPath(path);
                dto.setRecordUrl("https://thinhlpg-vixtts-demo.hf.space/file=" + path);
                dto.setOriginalName(path.substring(path.lastIndexOf("/") + 1));
                dto.setSize(file.getSize());

                return dto;
            } else {
                throw new RuntimeException("Failed to upload voice: " + response.getStatusCode());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public Page<UserRecord> findAll(Pageable pageable) {
        log.debug("Request to get all user record");
        // Modify pageable
        if (pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "userId");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        return userRecordRepository.findAll(pageable);
    }

    public UserRecord findOne(String id) {
        log.debug("Request to get user record {}", id);
        return userRecordRepository.findById(id).orElseThrow();
    }

    public void delete(String id) {
        log.debug("Request to delete user record {}", id);
        UserRecord userRecord = findOne(id);
        userRecordRepository.delete(userRecord);
    }
}
