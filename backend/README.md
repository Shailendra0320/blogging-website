# BlogApp Backend

Monolithic **Spring Boot 3.3** REST API for the blogging platform. Handles authentication (JWT), posts, comments, and user profiles. Persists data with **JPA** to **H2** (`dev`) or **MySQL** (`prod`).

---

## Tech stack

| Item | Choice |
|------|--------|
| Language | Java 17 |
| Framework | Spring Boot 3.3.2 (Web, Data JPA, Security, Validation) |
| Auth | Stateless JWT (jjwt 0.12.5) + BCrypt |
| DB | H2 (dev) / MySQL 8 (prod) |
| Build | Maven |

---

## Layered architecture

```
HTTP Request
    ↓
Controller   (AuthController, PostController, CommentController, UserController, HealthController)
    ↓
Service      (business rules, ownership checks, slug generation)
    ↓
Repository   (Spring Data JPA)
    ↓
Entity       (User, Post, Comment)  →  Database
```

Cross-cutting:

- `JwtAuthenticationFilter` — reads `Authorization: Bearer …` and sets the security context
- `SecurityConfig` — CORS, public vs protected routes, JSON 401/403 handlers
- `GlobalExceptionHandler` — consistent `{ timestamp, status, message }` errors

---

## Project layout

```
backend/
├── pom.xml
├── README.md
└── src/main/
    ├── java/com/blogapp/backend/
    │   ├── BackendApplication.java
    │   ├── config/
    │   │   ├── SecurityConfig.java
    │   │   └── DataSeeder.java          # demo user + posts (dev only)
    │   ├── security/
    │   │   ├── JwtUtil.java
    │   │   ├── JwtAuthenticationFilter.java
    │   │   └── CustomUserDetailsService.java
    │   ├── entity/                      # User, Post, Comment, Role
    │   ├── repository/
    │   ├── dto/
    │   ├── service/
    │   ├── controller/
    │   └── exception/
    └── resources/
        ├── application.properties       # active profile + JWT + port
        ├── application-dev.properties   # H2
        └── application-prod.properties  # MySQL
```

---

## Run (dev — recommended)

Needs only Java + Maven. Uses in-memory H2 and seeds demo data.

```bash
cd backend
mvn spring-boot:run
```

- API base: `http://localhost:8080/api`
- Health: `http://localhost:8080/api/health`
- H2 console: `http://localhost:8080/h2-console`  
  JDBC URL `jdbc:h2:mem:blogdb`, user `sa`, empty password

**Demo login:** `demo` / `password123`

---

## Run with MySQL (prod profile)

1. Start MySQL and ensure you can create/use database `blogdb` (auto-create is enabled in the JDBC URL).

2. Set credentials (env vars or edit `application-prod.properties`):

```bash
# Windows PowerShell example
$env:DB_URL="jdbc:mysql://localhost:3306/blogdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="yourpassword"
$env:JWT_SECRET="YmxvZ2FwcC1zdXBlci1zZWNyZXQtandULXNpZ25pbmcta2V5LWNoYW5nZS1pbi1wcm9kdWN0aW9uLTEyMzQ1Ng=="
```

3. Activate prod in `application.properties`:

```properties
spring.profiles.active=prod
```

Or:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

> DataSeeder does **not** run on `prod`. Register a user via the API or frontend.

---

## Build JAR

```bash
cd backend
mvn clean package
java -jar target/backend-1.0.0.jar
```

---

## Configuration reference

| Property | Meaning | Default |
|----------|---------|---------|
| `server.port` | HTTP port | `8080` |
| `spring.profiles.active` | `dev` or `prod` | `dev` |
| `app.jwt.secret` | Base64 HS256 key (≥ 256 bits) | set in properties |
| `app.jwt.expiration-ms` | Token lifetime | `86400000` (24h) |

---

## Security & CORS

Public (no token):

- `POST /api/auth/**`
- `GET /api/health/**`
- `GET /api/posts/**` (except `GET /api/posts/id/**`)
- `GET /api/users/{username}` (not `/me`)
- H2 console (dev)

Everything else requires a valid JWT.

Allowed browser origins: `http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:5173`, `http://127.0.0.1:5173`.

---

## REST API

Base path: `/api`

### Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/register` | `{ username, email, password, fullName? }` | `AuthResponse` + JWT |
| POST | `/auth/login` | `{ usernameOrEmail, password }` | `AuthResponse` + JWT |

### Posts

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/posts?page&size&q&category` | No | Published posts (search / filter) |
| GET | `/posts/{slug}` | No* | Single post; increments views |
| GET | `/posts/author/{username}` | No* | Author’s posts |
| GET | `/posts/id/{id}` | Yes | Load for edit (owner/admin) |
| POST | `/posts` | Yes | Create |
| PUT | `/posts/{id}` | Yes | Update (owner/admin) |
| DELETE | `/posts/{id}` | Yes | Delete (owner/admin) |

\* Optional auth so owners/admins can view drafts.

### Comments

| Method | Path | Auth |
|--------|------|:----:|
| GET | `/posts/{postId}/comments` | No |
| POST | `/posts/{postId}/comments` | Yes |
| DELETE | `/comments/{commentId}` | Yes (owner/admin) |

### Users

| Method | Path | Auth |
|--------|------|:----:|
| GET | `/users/me` | Yes |
| PUT | `/users/me` | Yes — `{ fullName?, bio? }` |
| GET | `/users/{username}` | No (public profile, no email) |

### Health

| Method | Path | Response |
|--------|------|----------|
| GET | `/health` | `{ "status": "UP", "service": "blog-backend", ... }` |

---

## Error format

```json
{
  "timestamp": "2026-07-27T10:00:00",
  "status": 400,
  "message": "Username is already taken"
}
```

Validation failures also include an `errors` map of field → message.

---

## Entities (tables)

- **users** — username, email, password (hashed), fullName, bio, role, createdAt  
- **posts** — title, slug, content (LONGTEXT), summary, coverImageUrl, category, published, views, author_id, timestamps  
- **comments** — content, post_id, author_id, createdAt  

---

## Connecting to the React frontend

1. Start this backend on port **8080**.
2. Frontend Axios base URL: `http://localhost:8080/api` (see `frontend/.env`).
3. After login, every protected call must send:

```
Authorization: Bearer <jwt>
```

Full system diagram and quick start: see the [root README](../README.md).
