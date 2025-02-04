package com.ronniebook.web.ebook.service;

import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.google.api.services.drive.model.Permission;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class GoogleDriveService {

    @Autowired
    private Drive googleDrive;

    private static final String APPLICATION_FOLDER_ID = "17dSVOgUulyr4QUbqGJdnordUkuuqhcLG";

    public List<File> getAllGoogleDriveFiles() throws IOException {
        FileList result = googleDrive.files().list().setFields("nextPageToken, files(id, name, parents, mimeType)").execute();
        return result.getFiles();
    }

    public String createNewFolder(String folderName) throws IOException {
        File fileMetadata = new File();
        fileMetadata.setName(folderName);
        fileMetadata.setMimeType("application/vnd.google-apps.folder");
        fileMetadata.setParents(Collections.singletonList(APPLICATION_FOLDER_ID));

        File file = googleDrive.files().create(fileMetadata).setFields("id").execute();
        addPermissionToFolder(googleDrive, file.getId());
        return file.getId();
    }

    public File uploadFile(String folderId, String fileName, MultipartFile file) throws IOException {
        File newGGDriveFile = new File();
        newGGDriveFile.setParents(Collections.singletonList(folderId)).setName(fileName);
        java.io.File fileToUpload = convertMultiPartToFile(file);

        // MIME type for .docx file
        FileContent mediaContent = new FileContent("application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileToUpload);
        return googleDrive.files().create(newGGDriveFile, mediaContent).setFields("id,webViewLink").execute();
    }

    public void deleteFile(String fileId) {
        try {
            googleDrive.files().delete(fileId).execute();
        } catch (IOException e) {
            System.out.println("An error occurred: " + e);
        }
    }

    private void addPermissionToFolder(Drive driveService, String folderId) throws IOException {
        Permission permission = new Permission().setType("user").setRole("reader").setEmailAddress("long.vo@ntq-solution.com.vn");
        driveService.permissions().create(folderId, permission).execute();
    }

    //    private void downloadFile(String fileId) {
    //        OutputStream outputStream = new ByteArrayOutputStream();
    //        googleDrive.files().get(fileId)
    //            .executeMediaAndDownloadTo(outputStream);
    //    }

    private java.io.File convertMultiPartToFile(MultipartFile file) throws IOException {
        java.io.File convFile = new java.io.File(System.getProperty("java.io.tmpdir") + "/" + file.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(convFile)) {
            fos.write(file.getBytes());
        }
        return convFile;
    }
}
