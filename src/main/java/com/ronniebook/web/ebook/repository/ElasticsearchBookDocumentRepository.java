package com.ronniebook.web.ebook.repository;

import com.ronniebook.web.ebook.domain.ElasticsearchBookDocument;
import java.util.List;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ElasticsearchBookDocumentRepository extends ElasticsearchRepository<ElasticsearchBookDocument, String> {
    List<ElasticsearchBookDocument> findByContentContaining(String keyword);
}
