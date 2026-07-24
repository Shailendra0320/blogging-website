package com.blogapp.backend.config;

import com.blogapp.backend.entity.Post;
import com.blogapp.backend.entity.Role;
import com.blogapp.backend.entity.User;
import com.blogapp.backend.repository.PostRepository;
import com.blogapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the H2 in-memory database with a demo user and a couple of posts
 * so the app is immediately usable after starting with the "dev" profile.
 * Does NOT run against the "prod" (MySQL) profile.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // already seeded
        }

        User demoUser = User.builder()
                .username("demo")
                .email("demo@blogapp.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Demo Author")
                .bio("I write about tech, life, and everything in between.")
                .role(Role.ROLE_ADMIN)
                .build();
        demoUser = userRepository.save(demoUser);

        Post post1 = Post.builder()
                .title("Welcome to My Blog")
                .slug("welcome-to-my-blog")
                .summary("A quick introduction to this blog and what to expect.")
                .content("<p>Hello and welcome! This blog was built with <strong>Spring Boot</strong> " +
                        "on the backend and <strong>React</strong> on the frontend. " +
                        "Feel free to explore, register an account, and leave a comment.</p>")
                .category("General")
                .coverImageUrl("https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200")
                .author(demoUser)
                .published(true)
                .build();

        Post post2 = Post.builder()
                .title("Getting Started with Spring Boot")
                .slug("getting-started-with-spring-boot")
                .summary("A beginner-friendly walkthrough of building REST APIs with Spring Boot.")
                .content("<p>Spring Boot makes it easy to create stand-alone, production-grade " +
                        "Spring based applications. In this post we cover controllers, services, " +
                        "repositories, and how they fit together in a layered architecture.</p>")
                .category("Programming")
                .coverImageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200")
                .author(demoUser)
                .published(true)
                .build();

        postRepository.save(post1);
        postRepository.save(post2);

        System.out.println("=================================================");
        System.out.println(" Demo data loaded. Login with:");
        System.out.println("   username: demo");
        System.out.println("   password: password123");
        System.out.println("=================================================");
    }
}
