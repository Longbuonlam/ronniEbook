package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.RonnieFile;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

public interface RonnieFileService {
    RonnieFile uploadFile(String folderId, MultipartFile file) throws IOException;

    String createNewFolder(String folderName) throws IOException;

    String createSubFolder(String folderName, String parentId) throws IOException;

    void deleteFile(String fileId);

    String uploadUserVoice(String folderId, MultipartFile file) throws IOException;

    String createVoiceFolder(String folderName) throws IOException;
}
