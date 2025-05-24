package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.domain.User;
import com.ronniebook.web.ebook.domain.UserImage;
import com.ronniebook.web.ebook.domain.dto.UserInfoDTO;
import com.ronniebook.web.ebook.domain.dto.UserProfileDTO;
import com.ronniebook.web.ebook.service.UserProfileService;
import com.ronniebook.web.security.SecurityUtils;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UserProfileResource {

    private static final Logger log = LoggerFactory.getLogger(UserProfileResource.class);

    private final UserProfileService userProfileService;

    public UserProfileResource(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @PostMapping("/user-profile/upload-image")
    public ResponseEntity<UserImage> uploadImage(@RequestParam MultipartFile image) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        log.debug("REST request to upload user profile image, user {}", userId);
        UserImage result = userProfileService.uploadImage(image, userId);
        return ResponseEntity.ok().body(result);
    }

    @PatchMapping("/user-profile/update")
    public ResponseEntity<User> updateProfile(@RequestBody UserProfileDTO userProfile) {
        log.debug("REST request to update user profile");
        User result = userProfileService.updateProfile(userProfile).orElseThrow();
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/user-profile/image")
    public ResponseEntity<String> getUserImage() {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        log.debug("REST request to get user {} 's image ", userId);
        String result = userProfileService.getCurrentUserImageUrl(userId);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/user-profile/info")
    public ResponseEntity<UserInfoDTO> getUserInfo() {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        log.debug("REST request to get database information of user {}", userId);
        String imageUrl = userProfileService.getCurrentUserImageUrl(userId);
        Instant createdDate = userProfileService.getCurrentUserCreatedDate(userId);
        UserInfoDTO result = new UserInfoDTO(imageUrl, createdDate);
        return ResponseEntity.ok().body(result);
    }
}
