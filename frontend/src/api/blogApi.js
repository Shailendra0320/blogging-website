import api from "./axiosConfig";

// ---------- HEALTH ----------
export const checkHealth = () => api.get("/health");

// ---------- AUTH ----------
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

// ---------- POSTS ----------
export const getPosts = (params = {}) => api.get("/posts", { params });
export const getPostBySlug = (slug) => api.get(`/posts/${slug}`);
export const getPostById = (id) => api.get(`/posts/id/${id}`);
export const getPostsByAuthor = (username, params = {}) =>
  api.get(`/posts/author/${username}`, { params });
export const createPost = (data) => api.post("/posts", data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// ---------- COMMENTS ----------
export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const addComment = (postId, data) =>
  api.post(`/posts/${postId}/comments`, data);
export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);

// ---------- USERS ----------
export const getCurrentUser = () => api.get("/users/me");
export const getUserByUsername = (username) => api.get(`/users/${username}`);
export const updateProfile = (data) => api.put("/users/me", data);

/** Pull a readable message from Spring Boot error JSON or network failures */
export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err.response) {
    return "Cannot reach the backend. Is it running on http://localhost:8080?";
  }
  const data = err.response.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    return Object.values(data.errors).join(" ");
  }
  return fallback;
};
