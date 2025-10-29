package com.arcengtr.PaletteGenerator.controllers;

import com.arcengtr.PaletteGenerator.dtos.UserDTO;
import com.arcengtr.PaletteGenerator.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/info")
    public UserDTO userInfo() {
        return userService.getCurrentUserInfo();
    }
}
