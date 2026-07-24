package com.blogapp.backend.controller;

import com.blogapp.backend.dto.CommentRequest;
import com.blogapp.backend.dto.CommentResponse;
import com.blogapp.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // Public: list comments for a post
    @GetMapping("/api/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }

    // Protected: add a comment to a post
    @PostMapping("/api/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long postId,
                                                        @Valid @RequestBody CommentRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(postId, request, authentication.getName()));
    }

    // Protected: delete own comment (or admin)
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
