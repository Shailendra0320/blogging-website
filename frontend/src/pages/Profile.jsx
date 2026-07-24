import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getUserByUsername, getPostsByAuthor, updateProfile } from "../api/blogApi";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", bio: "" });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser && currentUser.username === username;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        getUserByUsername(username),
        getPostsByAuthor(username, { page: 0, size: 12 }),
      ]);
      setProfile(profileRes.data);
      setForm({ fullName: profileRes.data.fullName || "", bio: profileRes.data.bio || "" });
      setPosts(postsRes.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-wrap">Loading...</div>;
  if (!profile)
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>User not found</h3>
        </div>
      </div>
    );

  return (
    <div className="container page">
      <div className="form-card wide" style={{ marginBottom: 32 }}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 style={{ marginBottom: 4 }}>{profile.fullName || profile.username}</h1>
            <p style={{ color: "#6b7280", marginTop: 0 }}>@{profile.username}</p>
            <p>{profile.bio || "No bio yet."}</p>
            {isOwnProfile && (
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </>
        )}
      </div>

      <h2>Posts by {profile.username}</h2>
      {posts.length === 0 ? (
        <p className="post-summary">No posts published yet.</p>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      )}
    </div>
  );
}
