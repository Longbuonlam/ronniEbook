package com.ronniebook.web.ebook.service;

import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.google.api.services.drive.model.Permission;
import com.ronniebook.web.ebook.domain.FileStatus;
import com.ronniebook.web.ebook.domain.FileStore;
import com.ronniebook.web.ebook.domain.RonnieFile;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class GoogleDriveService implements RonnieFileService {

    @Autowired
    private Drive googleDrive;

    private final Logger log = LoggerFactory.getLogger(GoogleDriveService.class);

    private static final String APPLICATION_FOLDER_ID = "17dSVOgUulyr4QUbqGJdnordUkuuqhcLG";

    public List<File> getAllGoogleDriveFiles() throws IOException {
        log.debug("Request to get all files from google drive");
        FileList result = googleDrive.files().list().setFields("nextPageToken, files(id, name, parents, mimeType)").execute();
        return result.getFiles();
    }

    @Override
    public String createNewFolder(String folderName) throws IOException {
        log.debug("Request to create new folder {}", folderName);
        File fileMetadata = new File();
        fileMetadata.setName(folderName);
        fileMetadata.setMimeType("application/vnd.google-apps.folder");
        fileMetadata.setParents(Collections.singletonList(APPLICATION_FOLDER_ID));

        File file = googleDrive.files().create(fileMetadata).setFields("id").execute();
        addPermissionToFolder(googleDrive, file.getId());
        return file.getId();
    }

    @Override
    public String createSubFolder(String folderName, String parentId) throws IOException {
        log.debug("Request to create sub folder {}", folderName);
        File fileMetadata = new File();
        fileMetadata.setName(folderName);
        fileMetadata.setMimeType("application/vnd.google-apps.folder");
        fileMetadata.setParents(Collections.singletonList(parentId));

        File file = googleDrive.files().create(fileMetadata).setFields("id").execute();
        addPermissionToFolder(googleDrive, file.getId());
        return file.getId();
    }

    @Override
    public RonnieFile uploadFile(String folderId, MultipartFile file) throws IOException {
        log.debug("Request to upload file {} to google drive", file.getOriginalFilename());
        File newGGDriveFile = new File();
        newGGDriveFile.setParents(Collections.singletonList(folderId)).setName(file.getOriginalFilename());
        java.io.File fileToUpload = convertMultiPartToFile(file);

        // MIME type for .docx file
        FileContent mediaContent = new FileContent("application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileToUpload);
        File googleDriveFile = googleDrive.files().create(newGGDriveFile, mediaContent).setFields("id,webViewLink").execute();
        log.debug("Successfully upload file to google drive");

        String googleDriveFileUrl = "https://docs.google.com/document/d/" + googleDriveFile.getId();
        return new RonnieFile(
            file.getOriginalFilename(),
            googleDriveFileUrl,
            FileStore.GOOGLE_DRIVE,
            FileStatus.UPLOAD_FINISH,
            googleDriveFile.getId(),
            folderId
        );
    }

    @Override
    public void deleteFile(String fileId) {
        try {
            log.debug("Request to delete file/folder {} from google drive", fileId);
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
