import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPostsByAuthor, deletePost } from "../api/blogApi";
import { useAuth } from "../context/AuthContext";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

export default function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getPostsByAuthor(user.username, { page: 0, size: 50 });
      setPosts(res.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <div className="container page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Posts</h1>
        <Link to="/create-post" className="btn btn-primary">+ New Post</Link>
      </div>

      {loading ? (
        <div className="spinner-wrap">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h3>You haven't written anything yet</h3>
          <Link to="/create-post" className="btn btn-primary" style={{ marginTop: 12, display: "inline-block" }}>
            Write your first post
          </Link>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card" style={{ flexDirection: "row", marginBottom: 14, padding: 16, alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <span className="post-category">{post.category || "Uncategorized"}</span>
              <h3 style={{ margin: "4px 0" }}>
                <Link to={`/posts/${post.slug}`}>{post.title}</Link>
              </h3>
              <div className="post-meta" style={{ border: "none", padding: 0 }}>
                <span>{formatDate(post.createdAt)}</span>
                <span>{post.published ? "Published" : "Draft"} · {post.views} views · {post.commentCount} comments</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to={`/edit-post/${post.id}`} className="btn btn-outline btn-sm">Edit</Link>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(post.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
