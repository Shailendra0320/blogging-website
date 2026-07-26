import React, { useEffect, useState, useCallback } from "react";
import { getPosts, getErrorMessage } from "../api/blogApi";
import PostCard from "../components/PostCard";

const CATEGORIES = ["All", "General", "Programming", "Technology", "Travel", "Life"];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, size: 9 };
      if (query) params.q = query;
      else if (category && category !== "All") params.category = category;
      const res = await getPosts(params);
      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      setPosts([]);
      setError(getErrorMessage(err, "Failed to load posts"));
    } finally {
      setLoading(false);
    }
  }, [page, query, category]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setCategory("All");
    setQuery(searchInput.trim());
  };

  const handleCategory = (cat) => {
    setQuery("");
    setSearchInput("");
    setPage(0);
    setCategory(cat);
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Latest Posts</h1>
        <p style={{ color: "#6b7280" }}>Stories, ideas, and updates from our writers.</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by title, summary, or category..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="category-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`chip ${category === cat && !query ? "chip-active" : ""}`}
            onClick={() => handleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrap">Loading posts...</div>
      ) : posts.length === 0 && !error ? (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p>Try a different search or check back later.</p>
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard post={post} key={post.id} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ alignSelf: "center", fontSize: 14 }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
