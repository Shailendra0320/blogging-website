import React, { useEffect, useState, useCallback } from "react";
import { getComments, addComment, deleteComment } from "../api/blogApi";
import { useAuth } from "../context/AuthContext";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentSection({ postId }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComments(postId);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await addComment(postId, { content });
      setContent("");
      loadComments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} style={{ margin: "16px 0" }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="post-summary">Log in to join the conversation.</p>
      )}

      {loading ? (
        <div className="spinner-wrap">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p className="post-summary">No comments yet. Be the first to comment!</p>
      ) : (
        comments.map((c) => (
          <div className="comment" key={c.id}>
            <div className="comment-header">
              <span>
                <span className="comment-author">{c.author?.username}</span>
                {" · "}
                {formatDate(c.createdAt)}
              </span>
              {user && (user.username === c.author?.username || user.role === "ROLE_ADMIN") && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              )}
            </div>
            <div>{c.content}</div>
          </div>
        ))
      )}
    </div>
  );
}
