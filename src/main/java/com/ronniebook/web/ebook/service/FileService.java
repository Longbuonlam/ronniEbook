package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.RonnieFile;
import com.ronniebook.web.ebook.domain.dto.RonnieFileDTO;
import com.ronniebook.web.ebook.repository.FileRepository;
import java.io.IOException;
import java.io.InputStream;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
        convertDocxToHtmlAndSaveContent(file, fileToSave);
    }

    private void convertDocxToHtmlAndSaveContent(MultipartFile file, RonnieFile ronnieFile) {
        log.debug("Request to convert docx to HTML");
        try {
            InputStream inputStream = file.getInputStream();
            XWPFDocument document = new XWPFDocument(inputStream);
            StringBuilder htmlContent = new StringBuilder();

            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText();
                if (text.trim().isEmpty()) {
                    htmlContent.append("<br>");
                } else {
                    if (paragraph.getStyleID() != null && paragraph.getStyleID().contains("Heading")) {
                        htmlContent.append("<h3>").append(text).append("</h3>");
                    } else {
                        htmlContent.append("<p>").append(text).append("</p>");
                    }
                }
            }
            document.close();
            inputStream.close();

            ronnieFile.setContent(htmlContent.toString());
            save(ronnieFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public Page<RonnieFileDTO> findAll(Pageable pageable, String chapterStorageId, String searchText) {
        log.debug("Request to get all files");
        if (pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "number");
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        }
        Page<RonnieFile> page;
        if (searchText == null) {
            page = fileRepository.findByChapterStorageId(pageable, chapterStorageId);
        } else {
            page = fileRepository.findByChapterStorageIdAndFileNameContains(pageable, chapterStorageId, searchText);
        }

        return page.map(
            file ->
                new RonnieFileDTO(
                    file.getId(),
                    file.getFileName(),
                    file.getFileUrl(),
                    file.getFileStore(),
                    file.getFileStatus(),
                    file.getStorageId(),
                    file.getChapterStorageId()
                )
        );
    }

    public RonnieFile findOne(String fileId) {
        log.debug("Request to get file {}", fileId);
        return fileRepository.findById(fileId).orElseThrow();
    }
}
