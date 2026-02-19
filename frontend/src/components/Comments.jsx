import { useState, useEffect } from "react";
import axios from "../api/axios";

export default function Comments({ postId, currentUsername, postOwner, isExpanded: externalExpanded, onToggle }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [localExpanded, setLocalExpanded] = useState(false);

  // Sync with external state if provided, otherwise manage internally
  const isExpanded = externalExpanded !== undefined ? externalExpanded : localExpanded;
  const toggle = onToggle || (() => setLocalExpanded(!localExpanded));

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/pub/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const response = await axios.post(`/pub/${postId}/comment`, { content });
      if (response.status === 200) {
        setContent("");
        fetchComments(); // refresh comments
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      if (err.response?.status === 401) {
        alert("You must be logged in to comment. Please login first.");
      } else {
        alert(err.response?.data?.error || "Failed to add comment. Please try again.");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.post(`/pub/${postId}/comment/${commentId}/delete`);
      if (response.status === 200) {
        fetchComments(); // refresh comments
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.response?.data?.error || "Failed to delete comment. Please try again.");
    }
  };

  const getInitials = (user) => {
    return user ? user.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="comments-section">
      {isExpanded && (
        <div className="comments-wrapper" style={{ animation: 'pulse 0.4s ease-out' }}>
          <div className="comments-list">
            {comments.length === 0 ? (
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                No stories shared here yet. Be the first!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="comment-item">
                  <div className="comment-avatar">
                    {getInitials(c.username)}
                  </div>
                  <div className="comment-content-wrapper" style={{ flex: 1 }}>
                    <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="comment-author">@{c.username}</span>
                      {(currentUsername === c.username || currentUsername === postOwner) && (
                        <button
                          className="comment-delete-btn"
                          onClick={() => {
                            if (window.confirm("Delete this comment permanently?")) {
                              handleDeleteComment(c._id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are your thoughts?"
              className="comment-input"
            />
            <button className="btn btn-primary" type="submit">
              Post Comment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
