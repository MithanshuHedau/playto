import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Posts
export const getPosts = () => api.get("/posts/");
export const getPost = (id) => api.get(`/posts/${id}/`);
export const createPost = (data) => api.post("/posts/", data);

// Comments
export const createComment = (data) => api.post("/comments/", data);

// Likes
export const likePost = (postId) =>
  api.post("/likes/like_post/", { post_id: postId });
export const unlikePost = (postId) =>
  api.post("/likes/unlike_post/", { post_id: postId });
export const likeComment = (commentId) =>
  api.post("/likes/like_comment/", { comment_id: commentId });
export const unlikeComment = (commentId) =>
  api.post("/likes/unlike_comment/", { comment_id: commentId });

// Leaderboard
export const getLeaderboard = () => api.get("/leaderboard/");

// User
export const getOrCreateUser = (username) =>
  api.post("/get-or-create-user/", { username });

export default api;
