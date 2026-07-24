import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, updatePost } from "../api/blogApi";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const res = await getPostById(id);
        setForm({
          title: res.data.title,
          summary: res.data.summary || "",
          content: res.data.content,
          category: res.data.category || "",
          coverImageUrl: res.data.coverImageUrl || "",
          published: res.data.published,
        });
      } catch (err) {
        setError("Post not found or you do not have access.");
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await updatePost(id, form);
      navigate(`/posts/${res.data.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner-wrap">Loading...</div>;
  if (error || !form)
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>{error}</h3>
        </div>
      </div>
    );

  return (
    <div className="container page">
      <div className="form-card wide">
        <h2>Edit post</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input name="coverImageUrl" value={form.coverImageUrl} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Summary</label>
            <textarea name="summary" value={form.summary} onChange={handleChange} rows={2} />
          </div>

          <div className="form-group">
            <label>Content (HTML supported)</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
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
              Published
            </label>
          </div>

          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
