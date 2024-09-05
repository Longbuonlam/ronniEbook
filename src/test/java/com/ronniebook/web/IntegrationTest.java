package com.ronniebook.web;

import com.ronniebook.web.config.AsyncSyncConfiguration;
import com.ronniebook.web.config.EmbeddedElasticsearch;
import com.ronniebook.web.config.EmbeddedMongo;
import com.ronniebook.web.config.EmbeddedRedis;
import com.ronniebook.web.config.JacksonConfiguration;
import com.ronniebook.web.config.TestSecurityConfiguration;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = { RonniEbookApp.class, JacksonConfiguration.class, AsyncSyncConfiguration.class, TestSecurityConfiguration.class }
)
@EmbeddedRedis
@EmbeddedMongo
@EmbeddedElasticsearch
public @interface IntegrationTest {
}
