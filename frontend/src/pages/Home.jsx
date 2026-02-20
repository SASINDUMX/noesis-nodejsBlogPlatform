import { useEffect, useState } from "react";
import axios from "../api/axios";
import Post from "../components/Post";
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

