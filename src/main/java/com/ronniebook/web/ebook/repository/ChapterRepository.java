package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.Chapter;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the Chapter entity.
 */
@Repository
public interface ChapterRepository extends MongoRepository<Chapter, String> {
    @Query("{'bookId': ?0, 'isDeleted': { '$ne': true }}")
    Page<Chapter> findByBookId(Pageable pageable, String bookId);

    @Query("{'bookId': ?0," + " 'chapterName': { $regex: ?1, $options: 'i' }," + " 'isDeleted': { '$ne': true }}")
    Page<Chapter> findByBookIdAndChapterNameContains(Pageable pageable, String bookId, String chapterName);

    @Query("{'_id': ?0, 'isDeleted': { '$ne': true }}")
    Optional<Chapter> findByChapterId(String chapterId);

    @Query("{'bookId': ?0, 'isDeleted': { '$ne': true }}")
    List<Chapter> findAllByBookId(String bookId);

    @Query("{'bookId': ?0, 'chapterName': {'$in': ?1}, 'isDeleted': { '$ne': true }}")
    List<Chapter> findAllByBookIdAndChapterNameIn(String bookId, List<String> chapterName);
}
