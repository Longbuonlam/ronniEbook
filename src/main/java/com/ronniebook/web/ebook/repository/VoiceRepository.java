package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.Voice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoiceRepository extends MongoRepository<Voice, String> {
    Voice findByBookId(String bookId);
}
