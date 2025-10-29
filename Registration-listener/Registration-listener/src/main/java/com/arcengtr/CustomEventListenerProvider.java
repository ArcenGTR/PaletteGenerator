package com.arcengtr;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.core.MediaType;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.keycloak.connections.httpclient.HttpClientProvider;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.models.KeycloakSession;

import java.nio.charset.StandardCharsets;


public class CustomEventListenerProvider implements EventListenerProvider {

    private static final String WEBHOOK_REGISTER_URL = "http://host.docker.internal:8080/api/v1/keycloak/register-hook";
    private static final String WEBHOOK_USERNAME_UPDATE_URL = "http://host.docker.internal:8080/api/v1/keycloak/profile-username-hook";

    private static final String WEBHOOK_SECRET = "nij23))kjn2ef0aASd";

    private final KeycloakSession session;

    private final ObjectMapper mapper = new ObjectMapper();

    public CustomEventListenerProvider(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public void onEvent(Event event) {
        if (event.getType().toString().equals("REGISTER")) {
            handleRegisterEvent(event);
        } else if (event.getType().toString().equals("UPDATE_PROFILE")) {
            handleProfileUpdateEvent(event);
        }
    }

    private void handleRegisterEvent(Event event) {
        String userId;
        String username;
        String email;

        String idp = event.getDetails().get("identity_provider");
        userId = event.getUserId();
        username = event.getDetails().get("username");
        email = event.getDetails().get("email");

        System.out.println("Keycloak Event: REGISTERED" + " | ID=" + userId + ", Username=" + username + ", Email=" + email);

        KeycloakUserDto userDto = new KeycloakUserDto(userId, username, email);

        sendWebhook(userDto, WEBHOOK_REGISTER_URL);
    }

    private void handleProfileUpdateEvent(Event event) {

        String updated_username = event.getDetails().get("updated_username");
        String previous_username = event.getDetails().get("previous_username");

        System.out.println("Keycloak Event: UPDATE PROFILE" + " | Previous username=" + previous_username + ", Updated username=" + updated_username);

        KeycloakUserDto userDto = new KeycloakUserDto(null, updated_username, null);

        sendWebhook(userDto, WEBHOOK_USERNAME_UPDATE_URL, "oldUsername", previous_username);
    }

    private void sendWebhook(KeycloakUserDto dto, String url) {
        CloseableHttpClient client = session.getProvider(HttpClientProvider.class).getHttpClient();
        try {
            HttpPost post = new HttpPost(url);
            post.addHeader("X-Webhook-Secret", WEBHOOK_SECRET);
            post.addHeader("Content-Type", MediaType.APPLICATION_JSON);
            post.setEntity(new StringEntity(mapper.writeValueAsString(dto), StandardCharsets.UTF_8));

            HttpResponse response = client.execute(post);

            if (response.getStatusLine().getStatusCode() == 200) {
                System.out.println("Webhook: successfully sent for userId=" + dto.getUserId());
            } else {
                System.out.println("Webhook: FAILED, response=" + response.getStatusLine().getStatusCode());
            }
        } catch (Exception e) {
            System.out.println("Webhook: FAILED to send for userId=" + dto.getUserId());
            e.printStackTrace();
        }
    }

    private void sendWebhook(KeycloakUserDto dto, String url, String parameter, String parameterValue) {
        CloseableHttpClient client = session.getProvider(HttpClientProvider.class).getHttpClient();
        try {
            HttpPost post = new HttpPost(url + "?" + parameter + "=" + parameterValue);
            post.addHeader("X-Webhook-Secret", WEBHOOK_SECRET);
            post.addHeader("Content-Type", MediaType.APPLICATION_JSON);
            post.setEntity(new StringEntity(mapper.writeValueAsString(dto), StandardCharsets.UTF_8));

            HttpResponse response = client.execute(post);

            if (response.getStatusLine().getStatusCode() == 200) {
                System.out.println("Webhook: successfully sent for userId=" + dto.getUserId());
            } else {
                System.out.println("Webhook: FAILED, response=" + response.getStatusLine().getStatusCode());
            }
        } catch (Exception e) {
            System.out.println("Webhook: FAILED to send for userId=" + dto.getUserId());
            e.printStackTrace();
        }
    }

    @Override
    public void onEvent(AdminEvent adminEvent, boolean b) {
    }

    @Override
    public void close() {

    }

    public static class KeycloakUserDto {

        private String userId;
        private String username;
        private String email;

        public KeycloakUserDto(String userId, String username, String email) {
            this.userId = userId;
            this.username = username;
            this.email = email;
        }

        public String getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
    }
}
