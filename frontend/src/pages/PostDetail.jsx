import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostBySlug, deletePost, getErrorMessage } from "../api/blogApi";
import CommentSection from "../components/CommentSection";
import { useAuth } from "../context/AuthContext";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPostBySlug(slug);
      setPost(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Post not found."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(post.id);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  if (loading) return <div className="spinner-wrap">Loading...</div>;
  if (error || !post)
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>{error || "Post not found"}</h3>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12, display: "inline-block" }}>
            Back to Home
          </Link>
        </div>
      </div>
    );

  const isOwner = user && (user.username === post.author?.username || user.role === "ROLE_ADMIN");

  return (
    <div className="container page">
      {post.coverImageUrl && (
        <img src={post.coverImageUrl} alt={post.title} className="post-detail-cover" />
      )}

      {post.category && <span className="post-category">{post.category}</span>}
      <h1 className="post-detail-title">{post.title}</h1>

      <div className="post-detail-meta">
        <span>
          By <strong>{post.author?.username}</strong>
        </span>
        <span>·</span>
        <span>{formatDate(post.createdAt)}</span>
        <span>·</span>
        <span>{post.views} views</span>
      </div>

      {isOwner && (
        <div className="post-actions">
          <Link to={`/edit-post/${post.id}`} className="btn btn-outline btn-sm">
            Edit
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}

      <div
        className="post-detail-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <CommentSection postId={post.id} />
    </div>
  );
}
