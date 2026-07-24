package com.blogapp.backend.service;

import com.blogapp.backend.dto.UserResponse;
import com.blogapp.backend.entity.User;
import com.blogapp.backend.exception.ResourceNotFoundException;
import com.blogapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return toResponse(user);
    }

    public UserResponse getCurrentUser(Authentication authentication) {
        return getByUsername(authentication.getName());
    }

    public User getEntityByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public UserResponse updateProfile(String username, String fullName, String bio) {
        User user = getEntityByUsername(username);
        if (fullName != null) user.setFullName(fullName);
        if (bio != null) user.setBio(bio);
        return toResponse(userRepository.save(user));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .bio(user.getBio())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
