package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.UserImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserImageRepository extends MongoRepository<UserImage, String> {
    UserImage findByUserId(String userId);
}
