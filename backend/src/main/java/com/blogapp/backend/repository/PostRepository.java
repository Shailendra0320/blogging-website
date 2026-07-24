package com.blogapp.backend.repository;

import com.blogapp.backend.entity.Post;
import com.blogapp.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<Post> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    Page<Post> findByCategoryIgnoreCaseAndPublishedTrueOrderByCreatedAtDesc(String category, Pageable pageable);

    Page<Post> findByTitleContainingIgnoreCaseAndPublishedTrueOrderByCreatedAtDesc(String keyword, Pageable pageable);
}
