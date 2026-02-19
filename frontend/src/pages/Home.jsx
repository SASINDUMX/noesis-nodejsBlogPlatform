import { useEffect, useState } from "react";
import axios from "../api/axios";
import Comments from "../components/Comments";
import "../index.css";

const LoadingSkeleton = () => (
  <div className="posts-list">
    {[1, 2, 3].map(i => (
      <div key={i} className="post-card" style={{ cursor: 'default' }}>
        <div className="skeleton" style={{ width: '80px', height: '20px', marginBottom: '1rem' }}></div>
        <div className="skeleton" style={{ width: '60%', height: '32px', marginBottom: '1rem' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '1rem' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '1rem' }}></div>
        <div className="post-actions" style={{ border: 'none', padding: 0 }}>
          <div className="skeleton" style={{ width: '100px', height: '40px' }}></div>
          <div className="skeleton" style={{ width: '100px', height: '40px' }}></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Home({ currentUsername }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState({});

  const updateCount = (postId, count) => {
    setCommentCounts(prev => ({ ...prev, [postId]: count }));
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/pub");
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      alert("Failed to load posts. Please try again.");
    } finally {
      // Small timeout for smooth skeleton transition
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const [expandedPostIds, setExpandedPostIds] = useState(new Set());

  const toggleComments = (postId) => {
    setExpandedPostIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="home-container">
        <h1 className="home-title">Explore Stories</h1>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Explore Stories</h1>
      {posts.length === 0 ? (
        <div className="post-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
          <h2 style={{ marginBottom: '1rem' }}>Silence is golden... for now</h2>
          <p style={{ color: 'var(--text-muted)' }}>Be the first to share your voice with the world.</p>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
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
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      const res = await axios.post(`/pub/${post._id}/like`);
                      setPosts(posts.map(p => p._id === post._id ? { ...p, likes: res.data.likes } : p));
                    } catch (err) {
                      console.error("Like error", err);
                      if (err.response?.status === 401) alert("Login to like posts");
                    }
                  }}
                >
                  ❤️ {post.likes > 0 && <span>({post.likes})</span>} Like
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => toggleComments(post._id)}
                  style={{ fontSize: '0.875rem' }}
                >
                  💬 {expandedPostIds.has(post._id) ? "Hide Comments" :
                    `Comments${commentCounts[post._id] ? ` (${commentCounts[post._id]})` : ""}`}
                </button>
              </div>

              <Comments
                postId={post._id}
                currentUsername={currentUsername}
                postOwner={post.username}
                isExpanded={expandedPostIds.has(post._id)}
                onToggle={() => toggleComments(post._id)}
                onCountChange={(count) => updateCount(post._id, count)}
              />

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

