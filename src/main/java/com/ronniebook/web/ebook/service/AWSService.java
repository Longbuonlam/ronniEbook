package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.RonnieFile;
import java.io.IOException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AWSService implements RonnieFileService {

    @Override
    public RonnieFile uploadFile(String folderId, MultipartFile file) throws IOException {
        return null;
    }

    @Override
    public String createNewFolder(String folderName) throws IOException {
        return "";
    }

    @Override
    public String createSubFolder(String folderName, String parentId) {
        return "";
    }

    @Override
    public void deleteFile(String fileId) {
        System.out.println("delete file from aws");
    }

    @Override
    public String uploadUserVoice(String folderId, MultipartFile file) throws IOException {
        return "";
    }

    @Override
    public String createVoiceFolder(String folderName) throws IOException {
        return "";
    }
}
