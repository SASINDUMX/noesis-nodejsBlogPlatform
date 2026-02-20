import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Post from "../components/Post";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Spinner from "../components/Spinner";
import { usePosts } from "../hooks";
import { toast } from "../utils/toast";
import { useState } from "react";

const Account = ({ onLogout, currentUsername, theme, onToggleTheme }) => {
  const { posts, loading, refetch } = usePosts("/pub/user");
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.get("/auth/logout");
      localStorage.removeItem("username");
      onLogout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <div className="home-container account-container">
      <div className="workspace-header">
        <h1 className="home-title">Personal Workspace</h1>

        <div className="theme-switch-container">
          <h3>Display Settings</h3>
          <button onClick={onToggleTheme} className="theme-switch-btn" aria-label="Toggle theme">
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="workspace-actions">
          <Link to="/create" className="btn btn-primary">
            <span aria-hidden="true">✨</span> New Post
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            disabled={loggingOut}
            style={{ minWidth: "120px", justifyContent: "center" }}
          >
            {loggingOut ? <Spinner size={16} /> : <><span aria-hidden="true">🚪</span> Logout</>}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={2} />
      ) : posts.length === 0 ? (
        <div className="post-card empty-state">
          <div className="empty-icon">🖋️</div>
          <h2>Your workspace is ready</h2>
          <p>Unleash your creativity and share your first story with the Noesis community today.</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Start Writing
          </Link>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUsername={currentUsername}
              fetchPosts={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Account;
