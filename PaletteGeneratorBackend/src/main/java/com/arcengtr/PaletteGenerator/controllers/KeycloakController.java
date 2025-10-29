package com.arcengtr.PaletteGenerator.controllers;

import com.arcengtr.PaletteGenerator.dtos.UserDTO;
import com.arcengtr.PaletteGenerator.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/keycloak")
@RequiredArgsConstructor
public class KeycloakController {

    @Value("${keycloak.webhook.secret}")
    private String webhookSecret;

    private final UserService userService;

    @PostMapping("/register-hook")
    ResponseEntity<?> keycloakRegistration(@RequestBody UserDTO userDTO,
                                           @RequestHeader("X-Webhook-Secret") String secret) {


        if (!secret.equals(webhookSecret)) {
            System.err.println("FORBIDDEN: Invalid webhook secret provided.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (userDTO == null || userDTO.getUsername() == null || userDTO.getUserId() == null) {
            System.err.println("BAD_REQUEST: Missing required user data from Keycloak.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        System.out.println("Keycloak registration on server started.");

        try {
            userService.saveUserFromKeycloak(userDTO);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Keycloak registration on server FAILED.");
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/profile-username-hook")
    ResponseEntity<?> keycloakProfileUpdate(@RequestBody UserDTO userDTO,
                                            @RequestHeader("X-Webhook-Secret") String secret,
                                            @RequestParam("oldUsername") String oldUsername) {
        if (!secret.equals(webhookSecret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (userDTO == null || userDTO.getUsername() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            userService.updateUsername(oldUsername, userDTO.getUsername());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
