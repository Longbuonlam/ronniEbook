package com.ronniebook.web.ebook.service;

import com.ronniebook.web.domain.Authority;
import com.ronniebook.web.ebook.domain.dto.UserProfileDTO;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class KeycloakService {

    @Value("${keycloak-key.admin.client-id}")
    private String clientId;

    @Value("${keycloak-key.admin.client-secret}")
    private String clientSecret;

    public String getAdminAccessToken() {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

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

    public void updateUserRoles(String keycloakUserId, Set<Authority> authorities) {
        String token = getAdminAccessToken();
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Lấy danh sách tất cả roles của realm
        ResponseEntity<Map[]> roleResponse = restTemplate.exchange(
            "http://localhost:9080/admin/realms/jhipster/roles",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            Map[].class
        );

        Map<String, Map<String, String>> availableRoles = Arrays.stream(roleResponse.getBody()).collect(
            Collectors.toMap(
                r -> ((String) r.get("name")).toUpperCase(),
                r -> Map.of("id", (String) r.get("id"), "name", (String) r.get("name"))
            )
        );

        // Lấy danh sách roles đang gán cho user (realm-level)
        ResponseEntity<Map> response = restTemplate.exchange(
            "http://localhost:9080/admin/realms/jhipster/users/" + keycloakUserId + "/role-mappings",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            Map.class
        );

        Map<String, Object> body = response.getBody();
        List<Map<String, Object>> assignedRoles = new ArrayList<>();

        if (body != null && body.containsKey("realmMappings")) {
            assignedRoles = (List<Map<String, Object>>) body.get("realmMappings");
        }

        // Xóa từng role hiện tại (nếu có)
        if (assignedRoles != null && !assignedRoles.isEmpty()) {
            restTemplate.exchange(
                "http://localhost:9080/admin/realms/jhipster/users/" + keycloakUserId + "/role-mappings/realm",
                HttpMethod.DELETE,
                new HttpEntity<>(assignedRoles, headers),
                Void.class
            );
        }

        // Chuẩn bị danh sách role mới cần gán
        List<Map<String, String>> rolesToAssign = new ArrayList<>();

        if (authorities.stream().anyMatch(a -> a.getName().equals("ROLE_USER")) && availableRoles.containsKey("ROLE_USER")) {
            rolesToAssign.add(availableRoles.get("ROLE_USER"));
        }

        if (authorities.stream().anyMatch(a -> a.getName().equals("ROLE_ADMIN")) && availableRoles.containsKey("ROLE_ADMIN")) {
            rolesToAssign.add(availableRoles.get("ROLE_ADMIN"));
        }

        if (availableRoles.containsKey("OFFLINE_ACCESS")) {
            rolesToAssign.add(availableRoles.get("OFFLINE_ACCESS"));
        }

        if (availableRoles.containsKey("UMA_AUTHORIZATION")) {
            rolesToAssign.add(availableRoles.get("UMA_AUTHORIZATION"));
        }

        // Gán lại role mới nếu có
        if (!rolesToAssign.isEmpty()) {
            restTemplate.postForEntity(
                "http://localhost:9080/admin/realms/jhipster/users/" + keycloakUserId + "/role-mappings/realm",
                new HttpEntity<>(rolesToAssign, headers),
                Void.class
            );
        }
    }

    public void updateUserStatus(String keycloakUserId, Boolean isActivated) {
        String token = getAdminAccessToken();

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Lấy danh sách tất cả roles của realm
        ResponseEntity<Map[]> roleResponse = restTemplate.exchange(
            "http://localhost:9080/admin/realms/jhipster/roles",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            Map[].class
        );

        Map[] allRoles = roleResponse.getBody();
        if (allRoles == null || allRoles.length == 0 || isActivated == null) return;

        // Lọc ra 2 role cần thao tác
        List<Map<String, Object>> targetRoles = Arrays.stream(allRoles)
            .filter(role -> {
                String name = (String) role.get("name");
                return "offline_access".equals(name) || "uma_authorization".equals(name);
            })
            .map(role -> {
                Map<String, Object> simplifiedRole = new HashMap<>();
                simplifiedRole.put("id", role.get("id"));
                simplifiedRole.put("name", role.get("name"));
                return simplifiedRole;
            })
            .collect(Collectors.toList());

        if (isActivated) {
            // Gán role
            restTemplate.postForEntity(
                "http://localhost:9080/admin/realms/jhipster/users/" + keycloakUserId + "/role-mappings/realm",
                new HttpEntity<>(targetRoles, headers),
                Void.class
            );
        } else {
            // Xoá role
            restTemplate.exchange(
                "http://localhost:9080/admin/realms/jhipster/users/" + keycloakUserId + "/role-mappings/realm",
                HttpMethod.DELETE,
                new HttpEntity<>(targetRoles, headers),
                Void.class
            );
        }
    }

    public static class User {

        private String id;

        public String getId() {
            return id;
        }
    }
}
