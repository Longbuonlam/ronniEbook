package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.RonnieFile;
import com.ronniebook.web.ebook.domain.dto.RonnieFileDTO;
import com.ronniebook.web.ebook.repository.FileRepository;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private final Logger log = LoggerFactory.getLogger(FileService.class);
    private final RonnieFileService ronnieFileService;
    private final UserService userService;
    private final FileRepository fileRepository;
    private final ElasticsearchService elasticsearchService;

    public FileService(
        RonnieFileService ronnieFileService,
        UserService userService,
        FileRepository fileRepository,
        ElasticsearchService elasticsearchService
    ) {
        this.ronnieFileService = ronnieFileService;
        this.userService = userService;
        this.fileRepository = fileRepository;
        this.elasticsearchService = elasticsearchService;
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
        setFileOrderAuto(folderId, fileToSave);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.toLowerCase().endsWith(".docx")) {
            convertDocxToHtmlAndSaveContent(file, fileToSave);
        }
    }

    private void convertDocxToHtmlAndSaveContent(MultipartFile file, RonnieFile ronnieFile) {
        log.debug("Request to convert docx to HTML");
        try {
            InputStream inputStream = file.getInputStream();
            XWPFDocument document = new XWPFDocument(inputStream);
            StringBuilder htmlContent = new StringBuilder();
            StringBuilder rawContent = new StringBuilder();

            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText();
                if (!text.isEmpty()) {
                    if (!text.endsWith(".")) {
                        text += ".";
                    }
                    rawContent.append(text).append("\n");
                }
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
            ronnieFile.setRawContent(rawContent.toString());
            fileRepository.save(ronnieFile);

            // save data to elasticsearch
            elasticsearchService.postData(ronnieFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Async
    private void setFileOrderAuto(String folderId, RonnieFile ronnieFile) {
        log.debug("Auto set order for file");
        int expectedOrder = 1;
        List<RonnieFile> files = findAllByStorageId(folderId);
        if (files != null) {
            List<Integer> orders = files.stream().map(RonnieFile::getOrder).sorted().toList();
            for (int i = 0; i < orders.size(); i++) {
                if (orders.get(i) - 1 != i) {
                    expectedOrder = i + 1;
                } else {
                    expectedOrder = orders.size() + 1;
                }
            }
        }
        ronnieFile.setOrder(expectedOrder);
        fileRepository.save(ronnieFile);
    }

    public Page<RonnieFileDTO> findAll(Pageable pageable, String chapterStorageId, String searchText) {
        log.debug("Request to get all files");
        if (pageable.getSort().isEmpty()) {
            Sort sort = Sort.by(Sort.Direction.ASC, "order");
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
                    file.getChapterStorageId(),
                    file.getOrder()
                )
        );
    }

    public RonnieFile findOne(String fileId) {
        log.debug("Request to get file {}", fileId);
        return fileRepository.findById(fileId).orElseThrow();
    }

    public List<RonnieFile> findAllByStorageId(String chapterStorageId) {
        log.debug("Request to get list files have chapter storage id {}", chapterStorageId);
        return fileRepository.findByChapterStorageId(chapterStorageId);
    }

    public Optional<RonnieFile> update(RonnieFile existingFile, RonnieFile newFile) {
        log.debug("Request to update file : {}", newFile);
        if (!userService.isAdmin()) {
            throw new BadRequestAlertException("", "", "Only admin can update chapter");
        }
        if (newFile.getFileStatus() != null) {
            existingFile.setFileStatus(newFile.getFileStatus());
        }
        return Optional.of(fileRepository.save(existingFile));
    }

    public void changeFileOrder(String chapterStorageId, Map<String, Integer> newOrder) {
        log.debug("Request to reorder files");
        List<RonnieFile> files = findAllByStorageId(chapterStorageId);
        for (RonnieFile file : files) {
            file.setOrder(newOrder.get(file.getId()));
            fileRepository.save(file);
        }
    }
}
