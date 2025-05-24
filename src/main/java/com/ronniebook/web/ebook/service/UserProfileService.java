package com.ronniebook.web.ebook.service;

import com.ronniebook.web.domain.User;
import com.ronniebook.web.ebook.domain.dto.UserProfileDTO;
import com.ronniebook.web.repository.UserRepository;
import com.ronniebook.web.security.SecurityUtils;
import com.ronniebook.web.service.UserService;
import com.ronniebook.web.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserProfileService {

    private final Logger log = LoggerFactory.getLogger(UserProfileService.class);
    private final UserRepository userRepository;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final KeycloakService keycloakService;

    public UserProfileService(
        UserRepository userRepository,
        UserService userService,
        CloudinaryService cloudinaryService,
        KeycloakService keycloakService
    ) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
        this.keycloakService = keycloakService;
    }

    public Optional<User> uploadImage(MultipartFile image, String userId) {
        log.debug("Request to upload image user profile");
        try {
            if (image.getSize() > 20 * 1024 * 1024) {
                throw new BadRequestAlertException("", "User", "File size exceeds the maximum allowed size of 20MB.");
            }

            String contentType = image.getContentType();
            if (!cloudinaryService.isImage(contentType)) {
                throw new BadRequestAlertException("", "User", "Invalid MIME type. Only image files are allowed!");
            }

            if (!cloudinaryService.hasImageExtension(image.getOriginalFilename())) {
                throw new BadRequestAlertException("", "User", "Invalid file extension. Only image files are allowed!");
            }
            String imageUrl = cloudinaryService.uploadImage(cloudinaryService.convertMultiPartToFile(image));

            User currentUser = userRepository.findOneByLogin(userId).orElseThrow();
            currentUser.setImageUrl(imageUrl);
            userRepository.save(currentUser);
            return Optional.of(currentUser);
        } catch (Exception e) {
            throw new BadRequestAlertException("", "", "Error when upload image to cloudinary");
        }
    }

    public Optional<User> updateProfile(UserProfileDTO updateUserInfo) {
        String userId = SecurityUtils.getCurrentUserLogin().orElseThrow();
        log.debug("Request to update user profile, user {}", userId);
        User currentUser = userRepository.findOneByLogin(userId).orElseThrow();
        if (updateUserInfo.getFirstName() != null) {
            currentUser.setFirstName(updateUserInfo.getFirstName());
        }
        if (updateUserInfo.getLastName() != null) {
            currentUser.setLastName(updateUserInfo.getLastName());
        }
        if (updateUserInfo.getEmail() != null) {
            currentUser.setEmail(updateUserInfo.getEmail());
        }
        userService.updateUser(
            currentUser.getFirstName(),
            currentUser.getLastName(),
            currentUser.getEmail(),
            currentUser.getLangKey(),
            currentUser.getImageUrl()
        );

        String keycloakUserId = keycloakService.findKeycloakUserId(userId);
        keycloakService.updateUserInKeycloak(keycloakUserId, updateUserInfo);

        return Optional.of(currentUser);
    }
}
