package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.RonnieFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends MongoRepository<RonnieFile, String> {
    RonnieFile findByStorageId(String storageId);

    Page<RonnieFile> findByChapterStorageId(Pageable pageable, String chapterStorageId);

    @Query("{'chapterStorageId': ?0," + " 'fileName': { $regex: ?1, $options: 'i' }}")
    Page<RonnieFile> findByChapterStorageIdAndFileNameContains(Pageable pageable, String chapterStorageId, String fileName);
}
