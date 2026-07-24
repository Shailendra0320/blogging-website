import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostCard({ post }) {
  return (
    <Link to={`/posts/${post.slug}`} className="post-card">
      <img src={post.coverImageUrl || FALLBACK_IMAGE} alt={post.title} />
      <div className="post-card-body">
        {post.category && <span className="post-category">{post.category}</span>}
        <h3>{post.title}</h3>
        <p className="post-summary">
          {post.summary || post.content?.replace(/<[^>]+>/g, "").slice(0, 120)}
        </p>
        <div className="post-meta">
          <span>{post.author?.username}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
