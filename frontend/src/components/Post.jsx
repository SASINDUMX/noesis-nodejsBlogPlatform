import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Comments from "./Comments";

export default function Post({ post, currentUsername, fetchPosts }) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || 0);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.post(`/pub/${post._id}/delete`);
      if (fetchPosts) fetchPosts(); // refresh posts after deletion
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(err.response?.data?.error || "Failed to delete post. Please try again.");
    }
  };

  const handleUpdate = () => {
    navigate(`/update/${post._id}`);
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`/pub/${post._id}/like`);
      setLikes(res.data.likes);
    } catch (err) {
      console.error("Like error", err);
      if (err.response?.status === 401) alert("Login to like posts");
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <span className="post-username">@{post.username}</span>
      </div>
      <h2 className="post-title">{post.title}</h2>
      {post.image && (
        <img
          src={`http://localhost:5000/uploads/${post.image}`}
          alt={post.title}
          className="post-image"
        />
      )}
      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button className="btn btn-primary" onClick={handleLike}>
          ❤️ {likes > 0 && <span>({likes})</span>} Like
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
          style={{ fontSize: "0.875rem" }}
        >
          💬 {isCommentsExpanded ? "Hide Comments" : "Comments"}
        </button>
        {currentUsername === post.username && (
          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
            <button className="btn btn-secondary" onClick={handleUpdate}>
              <span>✏️</span> Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <span>🗑️</span> Delete
            </button>
          </div>
        )}
      </div>

      <Comments
        postId={post._id}
        currentUsername={currentUsername}
        postOwner={post.username}
        isExpanded={isCommentsExpanded}
        onToggle={() => setIsCommentsExpanded(!isCommentsExpanded)}
      />
    </div>
  );
}
