package com.arcengtr.PaletteGenerator.services;

import com.arcengtr.PaletteGenerator.dtos.UserDTO;
import com.arcengtr.PaletteGenerator.entities.User;
import com.arcengtr.PaletteGenerator.mappers.UserMapper;
import com.arcengtr.PaletteGenerator.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return UUID.fromString(jwt.getSubject());
    }

    @Transactional
    public void saveUserFromKeycloak(UserDTO userDTO) {

        if (userRepository.findByUserId(userDTO.getUserId()).isEmpty()) {
            User user = userMapper.toEntity(userDTO);

            userRepository.save(user);
            System.out.println("User saved: " + userDTO.getUsername());
        } else {
            System.out.println("User not found: " + userDTO.getUsername());
        }
    }

    @Transactional
    public void updateUsername(String oldUsername, String newUsername) {
        userRepository.findByUsername(oldUsername).ifPresentOrElse(user -> {
            user.setUsername(newUsername);
            userRepository.save(user);
            System.out.println("Username updated: " + oldUsername + " -> " + newUsername);
        }, () -> System.err.println("User with username " + oldUsername + " not found"));
    }

    public UserDTO getCurrentUserInfo() {
        UUID userId = getCurrentUserId();

        return userRepository.findByUserId(userId).map(userMapper::toDto).orElse(null);
    }

}
