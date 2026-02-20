import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Post from "../components/Post";

const Account = ({ onLogout, currentUsername, theme, onToggleTheme }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/pub/user");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching user posts:", err);
      if (err.response?.status === 401) {
        alert("You must be logged in to view your posts. Please login first.");
      } else {
        alert("Failed to load your posts. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("/auth/logout");
      localStorage.removeItem("username");
      onLogout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <div className="account-container">
      <div className="workspace-header" style={{ marginBottom: '3rem' }}>
        <h1 className="home-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Personal workspace</h1>

        <div className="theme-switch-container">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Display Settings</h3>
          <button onClick={onToggleTheme} className="theme-switch-btn">
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link to="/create" className="btn btn-primary">
            <span>✨</span> New Post
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="post-card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🖋️</div>
          <h2 style={{ marginBottom: '1rem' }}>Your workspace is ready</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '400px', marginInline: 'auto' }}>
            Unleash your creativity and share your first story with the Noesis community today.
          </p>
          <Link to="/create" className="btn btn-primary">
            Start Writing
          </Link>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map(post => (
            <Post
              key={post._id}
              post={post}
              currentUsername={currentUsername}
              fetchPosts={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Account;
