import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, getErrorMessage } from "../api/blogApi";

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    coverImageUrl: "",
    published: true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await createPost(form);
      navigate(`/posts/${res.data.slug}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create post"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <div className="form-card wide">
        <h2>Write a new post</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Technology, Travel, Life"
            />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input
              name="coverImageUrl"
              value={form.coverImageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Summary</label>
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="A short teaser shown on the homepage"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Content (HTML supported)</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your post here. You can use <p>, <strong>, <em>, <h2>, etc."
              rows={12}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleChange}
                style={{ width: "auto", marginRight: 8 }}
              />
              Publish immediately
            </label>
          </div>

          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
