package com.ronniebook.web.ebook.rest;

import com.ronniebook.web.domain.User;
import com.ronniebook.web.ebook.domain.dto.UserProfileDTO;
import com.ronniebook.web.ebook.service.UserProfileService;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
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
    public ResponseEntity<User> uploadImage(@RequestParam MultipartFile image) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        log.debug("REST request to upload user profile image, user {}", userId);
        User result = userProfileService
            .uploadImage(image, userId)
            .orElseThrow(() -> new BadRequestAlertException("", "User-Profile", "Can not upload image for user profile"));
        return ResponseEntity.ok().body(result);
    }

    @PatchMapping("/user-profile/update")
    public ResponseEntity<User> updateProfile(@RequestBody UserProfileDTO userProfile) {
        log.debug("REST request to update user profile");
        User result = userProfileService.updateProfile(userProfile).orElseThrow();
        return ResponseEntity.ok().body(result);
    }
}
