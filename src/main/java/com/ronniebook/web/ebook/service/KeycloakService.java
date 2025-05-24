package com.ronniebook.web.ebook.service;

import com.ronniebook.web.ebook.domain.dto.UserProfileDTO;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class KeycloakService {

    public String getAdminAccessToken() {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", "admin-client");
        body.add("client_secret", "AuP0Q4iEabT86YpN1QbSsIZtF5uuXFpk");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            "http://localhost:9080/realms/jhipster/protocol/openid-connect/token",
            request,
            Map.class
        );

        return (String) response.getBody().get("access_token");
    }

    public void updateUserInKeycloak(String keycloakUserId, UserProfileDTO updateInfo) {
        String token = getAdminAccessToken();

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("firstName", updateInfo.getFirstName());
        payload.put("lastName", updateInfo.getLastName());
        payload.put("email", updateInfo.getEmail());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        restTemplate.exchange("http://localhost:9080/admin/realms/jhipster/users/" + keycloakUserId, HttpMethod.PUT, request, Void.class);
    }

    public String findKeycloakUserId(String username) {
        String token = getAdminAccessToken();

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<User[]> response = restTemplate.exchange(
            "http://localhost:9080/admin/realms/jhipster/users?username=" + username,
            HttpMethod.GET,
            request,
            User[].class
        );

        if (response.getBody() != null && response.getBody().length > 0) {
            return response.getBody()[0].getId(); // Keycloak userId
        }

        throw new RuntimeException("User not found on Keycloak");
    }

    public static class User {

        private String id;

        public String getId() {
            return id;
        }
    }
}
