package com.blogapp.backend.controller;

import com.blogapp.backend.dto.UserResponse;
import com.blogapp.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Protected: get the logged-in user's profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication));
    }

    // Public: view any user's public profile
    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        return ResponseEntity.ok(userService.getByUsername(username));
    }

    // Protected: update own profile (fullName, bio)
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody Map<String, String> body,
                                                        Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(
                authentication.getName(), body.get("fullName"), body.get("bio")));
    }
}
