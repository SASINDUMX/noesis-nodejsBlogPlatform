import { useState } from "react";
import axios from "../api/axios";
import Post from "../components/Post";

export default function Search({ currentUsername }) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchPosts = () => {
    // Re-run search to refresh posts
    handleSearch({ preventDefault: () => { } });
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
        textAlign: 'center'
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
          className="comment-input"
          style={{ flex: '1' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
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
      <div className="posts-list">
        {posts.length === 0 && !loading && query && (
          <div className="post-card" style={{ textAlign: 'center', padding: '3rem' }}>
            No posts found matching "{query}"
          </div>
        )}

        {!query && !loading && (
          <div className="post-card" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            Enter a search term to find posts
          </div>
        )}

        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            currentUsername={currentUsername}
            fetchPosts={fetchPosts}
          />
        ))}
      </div>
    </div>
  );
}
