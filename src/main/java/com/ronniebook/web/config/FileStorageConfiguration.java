package com.ronniebook.web.config;

import com.ronniebook.web.ebook.service.AWSService;
import com.ronniebook.web.ebook.service.GoogleDriveService;
import com.ronniebook.web.ebook.service.RonnieFileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileStorageConfiguration {

    @Value("${file.storage}")
    private String storageType;

    private final GoogleDriveService googleDriveService;
    private final AWSService awsService;

    public FileStorageConfiguration(GoogleDriveService googleDriveService, AWSService awsService) {
        this.googleDriveService = googleDriveService;
        this.awsService = awsService;
    }

    @Bean
    public RonnieFileService ronnieFileService() {
        if ("google-drive".equalsIgnoreCase(storageType)) {
            return googleDriveService;
        } else if ("AWS-S3".equalsIgnoreCase(storageType)) {
            return awsService;
        } else {
            throw new IllegalArgumentException("Invalid storage type: " + storageType);
        }
    }
}
