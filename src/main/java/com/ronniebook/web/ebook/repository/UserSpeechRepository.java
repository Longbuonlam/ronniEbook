package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.UserSpeech;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSpeechRepository extends MongoRepository<UserSpeech, String> {}
