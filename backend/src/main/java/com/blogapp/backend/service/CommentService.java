package com.blogapp.backend.service;

import com.blogapp.backend.dto.CommentRequest;
import com.blogapp.backend.dto.CommentResponse;
import com.blogapp.backend.entity.Comment;
import com.blogapp.backend.entity.Post;
import com.blogapp.backend.entity.Role;
import com.blogapp.backend.entity.User;
import com.blogapp.backend.exception.ResourceNotFoundException;
import com.blogapp.backend.exception.UnauthorizedException;
import com.blogapp.backend.repository.CommentRepository;
import com.blogapp.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;

    @Transactional
    public CommentResponse addComment(Long postId, CommentRequest request, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        User author = userService.getEntityByUsername(username);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .author(author)
                .build();

        return toResponse(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        return commentRepository.findByPostOrderByCreatedAtAsc(post)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        User currentUser = userService.getEntityByUsername(username);

        boolean isOwner = comment.getAuthor().getUsername().equals(username);
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to delete this comment");
        }
        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .postId(comment.getPost().getId())
                .author(userService.toResponse(comment.getAuthor()))
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
