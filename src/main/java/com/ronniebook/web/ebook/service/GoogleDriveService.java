package com.ronniebook.web.ebook.service;

import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.google.api.services.drive.model.Permission;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    //    public void uploadFile(String fileName, List<String> parents, java.io.File fileToUpload) {
    //        File newGGDriveFile = new File();
    //        newGGDriveFile.setParents(parents).setName(fileName);
    //        FileContent mediaContent = new FileContent("application/zip", fileToUpload);
    //        File file = googleDrive.files().create(newGGDriveFile, mediaContent).setFields("id,webViewLink").execute();
    //
    //    }

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

}
