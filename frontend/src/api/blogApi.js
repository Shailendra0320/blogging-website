import api from "./axiosConfig";

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
