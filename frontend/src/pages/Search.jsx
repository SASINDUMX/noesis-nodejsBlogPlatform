import { useState } from "react";
import axios from "../api/axios";

export default function Search() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({}); // track which posts are expanded
  const [commentText, setCommentText] = useState({});   // track comment input for each post

  // Search API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(`/pub/search?q=${encodeURIComponent(query)}`);
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching search results:", err);
      alert("Failed to search posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse for a post
  const toggleExpand = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Like a post
  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/pub/${postId}/like`);
      // Update local like count and likedBy status
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { 
                ...p, 
                likes: response.data.likes || p.likes || 0,
                likedBy: response.data.liked ? [...(p.likedBy || []), response.data.username] : (p.likedBy || []).filter(u => u !== response.data.username)
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
      if (err.response?.status === 401) {
        alert("You must be logged in to like a post. Please login first.");
      } else {
        alert("Failed to like post. Please try again.");
      }
    }
  };

  // Add comment
  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      const res = await axios.post(`/pub/${postId}/comment`, { content: text });
      // Refresh comments by fetching the post again or updating local state
      const updatedPost = await axios.get(`/pub/${postId}`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: updatedPost.data.post?.comments || p.comments || [] }
            : p
        )
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
      if (err.response?.status === 401) {
        alert("You must be logged in to comment. Please login first.");
      } else {
        alert("Failed to add comment. Please try again.");
      }
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      minHeight: '100vh'
    }}>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        textAlign: 'center',
        color: '#333'
      }}>Search Posts</h2>

      {/* Search Form */}
      <form 
        onSubmit={handleSearch} 
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="text"
          placeholder="Search posts by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '0.75rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#4A90E2'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: loading ? '#ccc' : '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#357ABD')}
          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#4A90E2')}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Loading...
        </div>
      )}

      {/* Search Results */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {posts.length === 0 && !loading && query && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666',
            fontSize: '1.1rem'
          }}>
            No posts found matching "{query}"
          </div>
        )}

        {!query && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#999',
            fontSize: '1rem'
          }}>
            Enter a search term to find posts
          </div>
        )}

        {posts.map((post) => (
          <div
            key={post._id}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '1.5rem',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
          >
            <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              @{post.username}
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#333',
              wordBreak: 'break-word'
            }}>
              {post.title}
            </h3>

            {/* Post Image */}
            {post.image && (
              <img
                src={`http://localhost:5000/uploads/${post.image}`}
                alt={post.title}
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'block'
                }}
              />
            )}

            {/* Post Content (expand/collapse) */}
            <p style={{
              marginBottom: '1rem',
              lineHeight: '1.6',
              color: '#555',
              wordBreak: 'break-word'
            }}>
              {expandedPosts[post._id] || (post.content && post.content.length <= 150)
                ? post.content
                : post.content?.slice(0, 150) + "..."}
              {post.content && post.content.length > 150 && (
                <button
                  onClick={() => toggleExpand(post._id)}
                  style={{
                    marginLeft: '0.5rem',
                    color: '#4A90E2',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.9rem'
                  }}
                >
                  {expandedPosts[post._id] ? "Show Less" : "Read More"}
                </button>
              )}
            </p>

            {/* Likes */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #eee'
            }}>
              <button
                onClick={() => handleLike(post._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ❤️
              </button>
              <span style={{ color: '#666', fontSize: '0.95rem' }}>
                {post.likes || 0} {post.likes === 1 ? 'Like' : 'Likes'}
              </span>
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: '#333',
                fontSize: '1rem'
              }}>
                Comments ({post.comments?.length || 0})
              </h4>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                marginBottom: '1rem',
                padding: '0.5rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '6px'
              }}>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((c, idx) => (
                    <div key={idx} style={{
                      marginBottom: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      <strong style={{ color: '#4A90E2' }}>@{c.username}:</strong>{' '}
                      <span style={{ color: '#555' }}>{c.content}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    No comments yet.
                  </p>
                )}
              </div>

              {/* Add Comment */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleComment(post._id);
                    }
                  }}
                  style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleComment(post._id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  Comment
                </button>
              </div>
            </div>

            <div style={{
              fontSize: '0.8rem',
              color: '#999',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #eee'
            }}>
              Posted on {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown date'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
