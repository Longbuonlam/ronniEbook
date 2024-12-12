package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.ebook.service.CloudinaryService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class CloudinaryResource {

    private final CloudinaryService cloudinaryService;

    public CloudinaryResource(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.getSize() > 20 * 1024 * 1024) { // 20MB
                throw new BadRequestAlertException("", "", "File size exceeds the maximum allowed size of 20MB.");
            }

            String contentType = file.getContentType();
            if (!cloudinaryService.isImage(contentType)) {
                throw new BadRequestAlertException("", "", "Invalid MIME type. Only image files are allowed!");
            }

            // Kiểm tra đuôi file
            if (!cloudinaryService.hasImageExtension(file.getOriginalFilename())) {
                throw new BadRequestAlertException("", "", "Invalid file extension. Only image files are allowed!");
            }
            String imageUrl = cloudinaryService.uploadImage(cloudinaryService.convertMultiPartToFile(file));
            System.out.println(imageUrl);
            return ResponseEntity.ok("Uploaded Successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error uploading file: " + e.getMessage());
        }
    }
}
