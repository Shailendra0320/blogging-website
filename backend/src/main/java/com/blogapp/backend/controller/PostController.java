package com.blogapp.backend.controller;

import com.blogapp.backend.dto.PostRequest;
import com.blogapp.backend.dto.PostResponse;
import com.blogapp.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // Public: paginated list of published posts, optional category/search filter
    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(postService.search(q, pageable));
        }
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(postService.getByCategory(category, pageable));
        }
        return ResponseEntity.ok(postService.getAllPublished(pageable));
    }

    // Public: single post by slug (also increments view count)
    @GetMapping("/{slug}")
    public ResponseEntity<PostResponse> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getBySlug(slug));
    }

    // Public: posts by a specific author's username
    @GetMapping("/author/{username}")
    public ResponseEntity<Page<PostResponse>> getPostsByAuthor(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(postService.getByAuthor(username, pageable));
    }

    // Protected: fetch a post by numeric id (used by the edit page; owner/admin enforced on save)
    @GetMapping("/id/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getById(id));
    }

    // Protected: create a post
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request,
                                                     Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createPost(request, authentication.getName()));
    }

    // Protected: update a post (owner or admin only)
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id,
                                                     @Valid @RequestBody PostRequest request,
                                                     Authentication authentication) {
        return ResponseEntity.ok(postService.updatePost(id, request, authentication.getName()));
    }

    // Protected: delete a post (owner or admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
