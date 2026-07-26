package com.blogapp.backend.service;

import com.blogapp.backend.dto.PostRequest;
import com.blogapp.backend.dto.PostResponse;
import com.blogapp.backend.entity.Post;
import com.blogapp.backend.entity.Role;
import com.blogapp.backend.entity.User;
import com.blogapp.backend.exception.ResourceNotFoundException;
import com.blogapp.backend.exception.UnauthorizedException;
import com.blogapp.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;

    @Transactional
    public PostResponse createPost(PostRequest request, String username) {
        User author = userService.getEntityByUsername(username);

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .summary(request.getSummary())
                .coverImageUrl(request.getCoverImageUrl())
                .category(request.getCategory())
                .published(request.getPublished() == null || request.getPublished())
                .author(author)
                .slug(generateUniqueSlug(request.getTitle()))
                .build();

        Post saved = postRepository.save(post);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getAllPublished(Pageable pageable) {
        return postRepository.findByPublishedTrueOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getByCategory(String category, Pageable pageable) {
        return postRepository.findByCategoryIgnoreCaseAndPublishedTrueOrderByCreatedAtDesc(category, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> search(String keyword, Pageable pageable) {
        return postRepository.searchPublished(keyword.trim(), pageable).map(this::toResponse);
    }

    /**
     * Public viewers only see published posts.
     * The author (or an admin) sees drafts as well.
     */
    @Transactional(readOnly = true)
    public Page<PostResponse> getByAuthor(String username, Pageable pageable, String viewerUsername) {
        User author = userService.getEntityByUsername(username);
        boolean canSeeDrafts = canViewDrafts(author.getUsername(), viewerUsername);

        if (canSeeDrafts) {
            return postRepository.findByAuthorOrderByCreatedAtDesc(author, pageable).map(this::toResponse);
        }
        return postRepository.findByAuthorAndPublishedTrueOrderByCreatedAtDesc(author, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public PostResponse getBySlug(String slug, String viewerUsername) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + slug));

        if (!post.isPublished() && !canViewDrafts(post.getAuthor().getUsername(), viewerUsername)) {
            throw new ResourceNotFoundException("Post not found: " + slug);
        }

        if (post.isPublished()) {
            post.setViews(post.getViews() + 1);
            postRepository.save(post);
        }
        return toResponse(post);
    }

    @Transactional
    public PostResponse updatePost(Long id, PostRequest request, String username) {
        Post post = getPostOrThrow(id);
        assertOwnerOrAdmin(post, username);

        if (!post.getTitle().equals(request.getTitle())) {
            post.setSlug(generateUniqueSlug(request.getTitle()));
        }
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setSummary(request.getSummary());
        post.setCoverImageUrl(request.getCoverImageUrl());
        post.setCategory(request.getCategory());
        if (request.getPublished() != null) {
            post.setPublished(request.getPublished());
        }

        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void deletePost(Long id, String username) {
        Post post = getPostOrThrow(id);
        assertOwnerOrAdmin(post, username);
        postRepository.delete(post);
    }

    /** Used by the edit page — only owner or admin may load a post by id. */
    @Transactional(readOnly = true)
    public PostResponse getById(Long id, String username) {
        Post post = getPostOrThrow(id);
        assertOwnerOrAdmin(post, username);
        return toResponse(post);
    }

    private Post getPostOrThrow(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
    }

    private boolean canViewDrafts(String authorUsername, String viewerUsername) {
        if (viewerUsername == null || viewerUsername.isBlank()) {
            return false;
        }
        if (authorUsername.equals(viewerUsername)) {
            return true;
        }
        User viewer = userService.getEntityByUsername(viewerUsername);
        return viewer.getRole() == Role.ROLE_ADMIN;
    }

    private void assertOwnerOrAdmin(Post post, String username) {
        User currentUser = userService.getEntityByUsername(username);
        boolean isOwner = post.getAuthor().getUsername().equals(username);
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to modify this post");
        }
    }

    private String generateUniqueSlug(String title) {
        String base = toSlug(title);
        if (base.isBlank()) {
            base = "post";
        }
        String slug = base;
        int counter = 1;
        while (postRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private String toSlug(String input) {
        String noWhitespace = Pattern.compile("[\\s]+").matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase();
    }

    public PostResponse toResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(post.getContent())
                .summary(post.getSummary())
                .coverImageUrl(post.getCoverImageUrl())
                .category(post.getCategory())
                .published(post.isPublished())
                .views(post.getViews())
                .commentCount(post.getComments() == null ? 0 : post.getComments().size())
                .author(userService.toPublicResponse(post.getAuthor()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
