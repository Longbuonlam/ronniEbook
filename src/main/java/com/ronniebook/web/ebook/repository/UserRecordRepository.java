package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.UserRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRecordRepository extends MongoRepository<UserRecord, String> {
    Page<UserRecord> findAll(Pageable pageable);
}
