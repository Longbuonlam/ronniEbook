package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.RonnieFile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends MongoRepository<RonnieFile, String> {
    RonnieFile findByStorageId(String storageId);
}
