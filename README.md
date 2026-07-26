# BlogApp — Full-Stack Blogging Platform

A blogging website with a **monolithic Spring Boot REST API** (Java + MySQL/H2) and a **React** SPA frontend. The two apps talk over HTTP/JSON; JWT secures protected routes.

---

## Architecture overview

```
┌─────────────────────────┐         REST + JWT          ┌──────────────────────────────┐
│   React Frontend        │  ────────────────────────►  │  Spring Boot Monolith         │
│   (localhost:3000)      │  ◄────────────────────────  │  (localhost:8080)             │
│                         │         JSON                │                              │
│  Pages / Components     │                             │  Controller → Service → Repo │
│  AuthContext            │                             │  JWT Filter + Spring Security│
│  Axios (api layer)      │                             │  JPA Entities                │
└─────────────────────────┘                             └──────────────┬───────────────┘
                                                                       │
                                                                       ▼
                                                            ┌──────────────────┐
                                                            │  H2 (dev) or     │
                                                            │  MySQL (prod)    │
                                                            └──────────────────┘
```

| Layer | Role |
|-------|------|
| **Frontend** | UI, routing, stores JWT in `localStorage`, calls `/api/*` |
| **Backend** | Single deployable JAR: auth, posts, comments, users |
| **Database** | H2 in-memory for quick demos; MySQL for real persistence |

This is a **monolithic backend** (one Spring Boot app), not microservices. The frontend is a separate SPA that never talks to the database directly.

---

## How frontend and backend connect

1. **Base URL** — Axios uses `REACT_APP_API_URL` (default `http://localhost:8080/api`).
2. **CORS** — Backend `SecurityConfig` allows origins `http://localhost:3000` and `http://localhost:5173`.
3. **Auth flow**
   - Register/Login → backend returns `{ token, userId, username, email, role }`
   - Frontend stores `token` + `user` in `localStorage`
   - Axios request interceptor sends `Authorization: Bearer <token>`
   - On `401` (except login/register), frontend clears the session and redirects to `/login`
4. **Health check** — `GET http://localhost:8080/api/health` confirms the API is up.

```
Frontend (.env)                    Backend (application.properties)
─────────────────                  ────────────────────────────────
REACT_APP_API_URL=                 server.port=8080
  http://localhost:8080/api        spring.profiles.active=dev|prod
                                   app.jwt.secret=...
                                   CORS → localhost:3000
```

---

## Repository structure

```
blog-app/
├── README.md                 ← you are here (architecture + connection)
├── backend/                  ← Spring Boot monolith
│   ├── README.md             ← backend setup, API, MySQL
│   ├── pom.xml
│   └── src/main/java/com/blogapp/backend/
│       ├── controller/       ← REST endpoints (/api/...)
│       ├── service/          ← business logic
│       ├── repository/       ← Spring Data JPA
│       ├── entity/           ← User, Post, Comment, Role
│       ├── dto/              ← request/response payloads
│       ├── security/         ← JWT util + filter
│       ├── config/           ← Security + DataSeeder
│       └── exception/        ← GlobalExceptionHandler
└── frontend/                 ← React CRA SPA
    ├── README.md             ← frontend setup + pages
    ├── package.json
    ├── .env / .env.example
    └── src/
        ├── api/              ← axiosConfig + blogApi (all HTTP calls)
        ├── context/          ← AuthContext
        ├── components/
        ├── pages/
        └── styles/
```

---

## Features

- Register / login with JWT (BCrypt passwords)
- Create, edit, delete posts (owner or admin); drafts vs published
- Auto-generated unique slugs, view counts, categories, cover image URLs
- Paginated feed, search (title/summary/category), category chips
- Comments (add/delete own or admin)
- Public profiles with editable bio
- Dev profile seeds demo user + sample posts

---

## Quick start (both apps)

### Prerequisites

- Java 17+, Maven 3.6+
- Node.js 18+, npm
- MySQL 8+ only if you use the `prod` profile

### Terminal 1 — Backend

```bash
cd backend
mvn spring-boot:run
```

API: **http://localhost:8080**  
Health: **http://localhost:8080/api/health**

Demo account (dev profile): `demo` / `password123`

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm start
```

App: **http://localhost:3000**

---

## API map (frontend ↔ backend)

| Frontend (`blogApi.js`) | Backend endpoint | Auth |
|-------------------------|------------------|:----:|
| `registerUser` | `POST /api/auth/register` | No |
| `loginUser` | `POST /api/auth/login` | No |
| `getPosts` | `GET /api/posts?page&size&q&category` | No |
| `getPostBySlug` | `GET /api/posts/{slug}` | No* |
| `getPostById` | `GET /api/posts/id/{id}` | Yes |
| `getPostsByAuthor` | `GET /api/posts/author/{username}` | No* |
| `createPost` / `updatePost` / `deletePost` | `POST/PUT/DELETE /api/posts...` | Yes |
| `getComments` / `addComment` | `GET/POST /api/posts/{id}/comments` | Get: No / Post: Yes |
| `deleteComment` | `DELETE /api/comments/{id}` | Yes |
| `getCurrentUser` / `updateProfile` | `GET/PUT /api/users/me` | Yes |
| `getUserByUsername` | `GET /api/users/{username}` | No |
| `checkHealth` | `GET /api/health` | No |

\* JWT optional: owners/admins can see drafts when authenticated.

---

## Request / response example

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{ "usernameOrEmail": "demo", "password": "password123" }
```

```json
{
  "token": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "demo",
  "email": "demo@blogapp.com",
  "role": "ROLE_ADMIN"
}
```

**Create post** (requires header `Authorization: Bearer <token>`)

```http
POST /api/posts
Content-Type: application/json

{
  "title": "My first post",
  "content": "<p>Hello world</p>",
  "summary": "A short teaser",
  "category": "General",
  "published": true
}
```

---

## Data model (simplified)

```
User 1──* Post 1──* Comment
  │         │
  │         └── author → User
  └── role: ROLE_USER | ROLE_ADMIN
```

---

## Profiles

| Profile | Database | When to use |
|---------|----------|-------------|
| `dev` (default) | H2 in-memory + seed data | Local demo, zero setup |
| `prod` | MySQL (`blogdb`) | Persistent / production-like runs |

Switch in `backend/src/main/resources/application.properties`:

```properties
spring.profiles.active=dev
# or
spring.profiles.active=prod
```

See [backend/README.md](backend/README.md) for MySQL details and [frontend/README.md](frontend/README.md) for UI routes and env vars.

---

## Common connection issues

| Symptom | Fix |
|---------|-----|
| CORS error in browser | Backend on `:8080`, frontend on `:3000`; origins must match `SecurityConfig` |
| “Cannot reach the backend” | Start Spring Boot first; check `/api/health` |
| 401 on Write / My Posts | Log in again; token expires after 24h by default |
| MySQL connection refused | Use `prod` profile only with MySQL running and correct credentials |
| Empty home feed on first MySQL run | No seeder on `prod` — register and create posts |

---

## Suggested next steps

- Multipart image upload instead of cover URL only
- Rich text editor (TipTap / Quill)
- Refresh tokens
- Docker Compose (backend + MySQL + frontend)
- Optional: serve `frontend/build` from Spring Boot static resources for a single artifact
