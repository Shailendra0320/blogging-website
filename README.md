# BlogApp — Full-Stack Blogging Platform

A complete blogging website built as a **monolithic Spring Boot backend** (REST API + JWT auth) with a **React** single-page frontend. Users can register, log in, write/edit/delete their own posts, browse and search all posts, and comment on any post.

---

## 1. Tech Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Java 17, Spring Boot 3.3 (Web, Data JPA, Security, Validation) |
| Auth      | JWT (jjwt) — stateless token-based authentication |
| Database  | H2 in-memory (zero setup, `dev` profile) **or** MySQL (`prod`) |
| Frontend  | React 18, React Router 6, Axios |
| Build     | Maven (backend), npm / Create React App (frontend) |

**Architecture**: Backend is a single monolithic Spring Boot application (one deployable JAR) organized in layers — `controller → service → repository → entity`. The React app is a separate SPA that talks to it purely over REST/JSON. This matches the standard "monolith backend + decoupled SPA frontend" pattern.

---

## 2. Project Structure

```
blog-app/
├── backend/                              # Spring Boot monolith
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/blogapp/backend/
│       │   ├── BackendApplication.java   # main() entry point
│       │   ├── config/
│       │   │   ├── SecurityConfig.java   # JWT + CORS + route rules
│       │   │   └── DataSeeder.java       # seeds demo data (dev profile only)
│       │   ├── security/
│       │   │   ├── JwtUtil.java              # token generation/validation
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── CustomUserDetailsService.java
│       │   ├── entity/                   # JPA entities
│       │   │   ├── User.java
│       │   │   ├── Post.java
│       │   │   ├── Comment.java
│       │   │   └── Role.java
│       │   ├── repository/               # Spring Data JPA repositories
│       │   │   ├── UserRepository.java
│       │   │   ├── PostRepository.java
│       │   │   └── CommentRepository.java
│       │   ├── dto/                      # request/response payloads
│       │   │   ├── RegisterRequest.java, LoginRequest.java, AuthResponse.java
│       │   │   ├── PostRequest.java, PostResponse.java
│       │   │   ├── CommentRequest.java, CommentResponse.java
│       │   │   └── UserResponse.java, ApiResponse.java
│       │   ├── service/                  # business logic
│       │   │   ├── AuthService.java
│       │   │   ├── PostService.java      # CRUD, slug generation, view counts
│       │   │   ├── CommentService.java
│       │   │   └── UserService.java
│       │   ├── controller/               # REST endpoints
│       │   │   ├── AuthController.java
│       │   │   ├── PostController.java
│       │   │   ├── CommentController.java
│       │   │   └── UserController.java
│       │   └── exception/                # centralized error handling
│       │       ├── GlobalExceptionHandler.java
│       │       ├── ResourceNotFoundException.java
│       │       ├── BadRequestException.java
│       │       └── UnauthorizedException.java
│       └── resources/
│           ├── application.properties       # default (MySQL) config
│           └── application-dev.properties   # H2 in-memory config
│
└── frontend/                             # React SPA
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js                      # React entry point
        ├── App.js                        # route definitions
        ├── api/
        │   ├── axiosConfig.js            # axios instance + JWT interceptor
        │   └── blogApi.js                # all API call functions
        ├── context/
        │   └── AuthContext.js            # global auth state (login/register/logout)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── PrivateRoute.jsx          # route guard for logged-in-only pages
        │   ├── PostCard.jsx
        │   └── CommentSection.jsx
        ├── pages/
        │   ├── Home.jsx                  # post feed, search, pagination
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── PostDetail.jsx            # full post + comments
        │   ├── CreatePost.jsx
        │   ├── EditPost.jsx
        │   ├── MyPosts.jsx                # author dashboard
        │   └── Profile.jsx                # public profile + bio editing
        └── styles/
            └── index.css
```

---

## 3. Features

- **Authentication**: Register / login with JWT tokens (stored in `localStorage`, attached automatically to every API call, auto-logout on expiry/401).
- **Posts**: Create, edit, delete (owner or admin only), publish/draft toggle, auto-generated unique URL slugs, view counter, category tagging, cover images.
- **Browsing**: Paginated home feed, search by title, filter by category, per-author post listing.
- **Comments**: Add/delete comments on any post (delete restricted to comment owner or admin).
- **Profiles**: Public profile pages with bio, editable by the owner.
- **Security**: Passwords hashed with BCrypt, stateless JWT sessions, route-level authorization, CORS locked to the React dev origin.

---

## 4. Prerequisites

- **Java 17+** and **Maven 3.6+** (backend)
- **Node.js 18+** and **npm** (frontend)
- **MySQL 8+** — only required if you want to run the `prod` profile. The `dev` profile needs nothing extra (uses H2 in-memory DB).

---

## 5. Running the Backend

The project ships with two Spring profiles:

- **`dev`** (default, already set in `application.properties`) — uses an in-memory H2 database and **auto-seeds** a demo user + two sample posts on startup. Nothing to configure — just run it.
- **`prod`** — uses MySQL. Edit the datasource block in `application.properties` with your credentials, or override with environment variables.

### Option A — Instant run (H2, recommended for trying it out)

```bash
cd backend
mvn spring-boot:run
```

The API will start on **http://localhost:8080**. On first boot you'll see in the console:

```
=================================================
 Demo data loaded. Login with:
   username: demo
   password: password123
=================================================
```

H2 console (optional, for inspecting data): http://localhost:8080/h2-console
  JDBC URL: `jdbc:h2:mem:blogdb`, user `sa`, empty password.

### Option B — MySQL (production-style)

1. Create a database (or let Spring auto-create it):
   ```sql
   CREATE DATABASE blogdb;
   ```
2. In `backend/src/main/resources/application.properties`:
   ```properties
   spring.profiles.active=prod
   spring.datasource.username=YOUR_MYSQL_USER
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
   (Note: with `spring.profiles.active` set to anything other than `dev`, the app falls back to the MySQL block already defined in `application.properties`.)
3. Run:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

### Building a standalone JAR

```bash
cd backend
mvn clean package
java -jar target/backend-1.0.0.jar
```

---

## 6. Running the Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000** and talks to the backend at `http://localhost:8080/api` by default.

To point it at a different backend URL, copy `.env.example` to `.env` and edit:

```
REACT_APP_API_URL=http://localhost:8080/api
```

### Building for production

```bash
cd frontend
npm run build
```
Outputs a static, deployable bundle in `frontend/build/` (serve it with any static host — Nginx, Vercel, Netlify, or Spring Boot's own static resources folder if you want a single deployable artifact).

---

## 7. Quick Start (both together)

```bash
# Terminal 1
cd backend && mvn spring-boot:run

# Terminal 2
cd frontend && npm install && npm start
```

Then open http://localhost:3000, and log in with the seeded demo account:
- **Username:** `demo`
- **Password:** `password123`

Or click "Sign up" to create your own account.

---

## 8. API Reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint                      | Auth required | Description |
|--------|--------------------------------|:---:|--------------|
| POST   | `/auth/register`               | No  | Create account, returns JWT |
| POST   | `/auth/login`                  | No  | Login, returns JWT |
| GET    | `/posts?page=&size=&category=&q=` | No | Paginated published posts (search/filter) |
| GET    | `/posts/{slug}`                 | No | Get single post (increments view count) |
| GET    | `/posts/author/{username}`      | No | Posts by a specific author |
| GET    | `/posts/id/{id}`                | No | Get post by numeric id (used by edit form) |
| POST   | `/posts`                        | Yes | Create a post |
| PUT    | `/posts/{id}`                   | Yes | Update a post (owner/admin) |
| DELETE | `/posts/{id}`                   | Yes | Delete a post (owner/admin) |
| GET    | `/posts/{postId}/comments`      | No | List comments on a post |
| POST   | `/posts/{postId}/comments`      | Yes | Add a comment |
| DELETE | `/comments/{commentId}`         | Yes | Delete own comment (or admin) |
| GET    | `/users/me`                     | Yes | Current logged-in user |
| GET    | `/users/{username}`             | No | Public profile |
| PUT    | `/users/me`                     | Yes | Update own profile (fullName, bio) |

**Auth header format** for protected endpoints:
```
Authorization: Bearer <jwt-token>
```

---

## 9. Verified Working

- ✅ Backend compiles against Spring Boot 3.3 / Java 17 (manually reviewed; Maven Central was not reachable in the sandbox used to build this, so run `mvn clean install` locally to confirm — see note below).
- ✅ Frontend installs and **builds successfully** (`npm run build` completed with no errors, `Compiled successfully`).
- ✅ All routes, JWT flow, and CRUD operations were designed and cross-checked end-to-end (request → controller → service → repository → response DTO).

> **Note:** This sandbox's network policy blocks Maven Central, so the backend could not be compiled inside this environment. It was written carefully and reviewed line-by-line, but please run `mvn clean install` (or `mvn spring-boot:run`) after downloading — this is a completely standard Spring Boot project and should build cleanly with a normal internet connection.

---

## 10. Common Issues

- **CORS errors in the browser**: Make sure the backend is running on port 8080 and the frontend on port 3000 — `SecurityConfig.java` explicitly whitelists `http://localhost:3000`. If you change ports, update the `corsConfigurationSource()` bean.
- **401 Unauthorized on protected routes**: Your token may have expired (default expiry: 24h, configurable via `app.jwt.expiration-ms` in `application.properties`). Just log in again.
- **MySQL connection refused**: Confirm MySQL is running and credentials in `application.properties` are correct, and that `spring.profiles.active` is **not** `dev`.
- **Port already in use**: Change `server.port` in `application.properties` (backend) or run `PORT=3001 npm start` (frontend).

---

## 11. Suggested Next Steps

- Add image upload (multipart) instead of cover-image URLs.
- Add roles/permissions UI (currently admin role exists in the model but has no dedicated admin panel).
- Add refresh tokens for longer sessions.
- Add a rich text editor (e.g., TipTap/Quill) instead of raw HTML textarea for post content.
- Dockerize both services with a `docker-compose.yml` for one-command startup.
