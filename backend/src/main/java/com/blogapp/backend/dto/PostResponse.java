package com.blogapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String summary;
    private String coverImageUrl;
    private String category;
    private boolean published;
    private long views;
    private long commentCount;
    private UserResponse author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
