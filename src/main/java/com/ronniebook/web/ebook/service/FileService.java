package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.RonnieFile;
import com.ronniebook.web.ebook.repository.FileRepository;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private final Logger log = LoggerFactory.getLogger(FileService.class);
    private final RonnieFileService ronnieFileService;
    private final FileRepository fileRepository;

    public FileService(RonnieFileService ronnieFileService, FileRepository fileRepository) {
        this.ronnieFileService = ronnieFileService;
        this.fileRepository = fileRepository;
    }

    private void save(RonnieFile file) {
        log.debug("Request to save file {} to database", file);
        fileRepository.save(file);
    }

    public void deleteFile(String storageId) {
        //delete file from cloud storage
        ronnieFileService.deleteFile(storageId);
        RonnieFile file = fileRepository.findByStorageId(storageId);
        if (file != null) {
            log.debug("Request to delete file from database, id {}", file.getId());
            fileRepository.delete(file);
        }
    }

    public void uploadFile(String folderId, MultipartFile file) throws IOException {
        RonnieFile fileToSave = ronnieFileService.uploadFile(folderId, file);
        save(fileToSave);
    }
}
