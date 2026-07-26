package com.blogapp.backend.repository;

import com.blogapp.backend.entity.Post;
import com.blogapp.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<Post> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    Page<Post> findByAuthorAndPublishedTrueOrderByCreatedAtDesc(User author, Pageable pageable);

    Page<Post> findByCategoryIgnoreCaseAndPublishedTrueOrderByCreatedAtDesc(String category, Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            WHERE p.published = true
              AND (
                   LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(p.summary, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY p.createdAt DESC
            """)
    Page<Post> searchPublished(@Param("keyword") String keyword, Pageable pageable);
}
