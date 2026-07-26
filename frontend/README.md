# BlogApp Frontend

React **SPA** for the blogging platform. Talks only to the Spring Boot REST API over HTTP/JSON (never to MySQL/H2 directly).

---

## Tech stack

| Item | Choice |
|------|--------|
| UI | React 18 |
| Routing | React Router 6 |
| HTTP | Axios |
| Scaffold | Create React App (`react-scripts` 5) |
| Auth state | React Context + `localStorage` |

---

## How it connects to the backend

```
Browser (localhost:3000)
    │
    │  Axios baseURL = REACT_APP_API_URL
    │  (default http://localhost:8080/api)
    ▼
Spring Boot API (localhost:8080)
```

1. Copy env (already provided as `.env` for local use):

```bash
# .env
REACT_APP_API_URL=http://localhost:8080/api
```

2. On login/register, `AuthContext` saves:
   - `localStorage.token` — JWT
   - `localStorage.user` — `{ userId, username, email, role }`

3. `axiosConfig.js` attaches `Authorization: Bearer <token>` on every request.

4. On `401` (except auth endpoints), session is cleared and the user is sent to `/login`.

**Backend must be running first.** Tip: open `http://localhost:8080/api/health` in the browser.

---

## Project layout

```
frontend/
├── package.json
├── .env / .env.example
├── public/index.html
└── src/
    ├── index.js                 # BrowserRouter + AuthProvider
    ├── App.js                   # route table
    ├── api/
    │   ├── axiosConfig.js       # Axios instance, JWT + 401 handling
    │   └── blogApi.js           # thin wrappers for every backend endpoint
    ├── context/
    │   └── AuthContext.js       # login / register / logout
    ├── components/
    │   ├── Navbar.jsx
    │   ├── PrivateRoute.jsx     # guards Write / Edit / My Posts
    │   ├── PostCard.jsx
    │   └── CommentSection.jsx
    ├── pages/
    │   ├── Home.jsx             # feed, search, category chips, pagination
    │   ├── Login.jsx / Register.jsx
    │   ├── PostDetail.jsx
    │   ├── CreatePost.jsx / EditPost.jsx
    │   ├── MyPosts.jsx
    │   └── Profile.jsx
    └── styles/index.css
```

---

## Run locally

```bash
cd frontend
npm install
npm start
```

Opens **http://localhost:3000**.

Ensure the backend is at **http://localhost:8080** (see [backend/README.md](../backend/README.md)).

Demo account (dev backend profile): **demo** / **password123**

---

## Production build

```bash
cd frontend
npm run build
```

Static files land in `frontend/build/`. Host with Nginx, Netlify, Vercel, or copy into Spring Boot `static/` if you want one deployable unit.

Set `REACT_APP_API_URL` to your deployed API URL **before** building.

---

## Routes

| Path | Page | Auth |
|------|------|:----:|
| `/` | Home — posts, search, categories | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/posts/:slug` | Post detail + comments | No |
| `/profile/:username` | Public profile | No |
| `/create-post` | New post | Yes |
| `/edit-post/:id` | Edit post | Yes |
| `/my-posts` | Author dashboard | Yes |

`PrivateRoute` redirects unauthenticated users to `/login` and preserves the intended destination.

---

## API module (`blogApi.js`)

| Function | Backend call |
|----------|--------------|
| `checkHealth` | `GET /health` |
| `registerUser` / `loginUser` | `POST /auth/register` / `login` |
| `getPosts` | `GET /posts` |
| `getPostBySlug` / `getPostById` | `GET /posts/{slug}` / `/posts/id/{id}` |
| `getPostsByAuthor` | `GET /posts/author/{username}` |
| `createPost` / `updatePost` / `deletePost` | `POST` / `PUT` / `DELETE` |
| `getComments` / `addComment` / `deleteComment` | comments endpoints |
| `getCurrentUser` / `getUserByUsername` / `updateProfile` | users endpoints |
| `getErrorMessage` | maps Spring error JSON / network failures to UI text |

---

## Auth flow (UI)

```
Register/Login form
       ↓
AuthContext → blogApi → POST /api/auth/...
       ↓
Store token + user
       ↓
Navbar shows Write / My Posts / username
       ↓
Protected pages send Bearer token automatically
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server (port 3000) |
| `npm run build` | Production bundle |
| `npm test` | CRA test runner |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Blank feed / “Cannot reach the backend” | Is Spring Boot up? CORS? Correct `REACT_APP_API_URL`? |
| Stuck on login after success | Hard-refresh; confirm token in DevTools → Application → Local Storage |
| 403 on edit/delete | Only the author (or `ROLE_ADMIN`) can modify that post/comment |
| Env not applied | Restart `npm start` after changing `.env` (CRA reads env at start) |

Architecture and full-stack quick start: [root README](../README.md).
