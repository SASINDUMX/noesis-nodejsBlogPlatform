import { useState, useCallback } from "react";
import axios from "../api/axios";
import Post from "../components/Post";
import Spinner from "../components/Spinner";
import { toast } from "../utils/toast";

export default function Search({ currentUsername }) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(`/pub/search?q=${encodeURIComponent(query.trim())}`);
      setPosts(res.data || []);
      setHasSearched(true);
    } catch (err) {
      console.error("Error fetching search results:", err);
      toast.error("Failed to search posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const refetch = useCallback(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="home-container">
      <h1 className="home-title">Search Posts</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="search"
          placeholder="Search posts by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="comment-input search-input"
          aria-label="Search posts"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn btn-primary"
          style={{ minWidth: "110px", justifyContent: "center" }}
        >
          {loading ? <Spinner size={18} color="white" /> : "Search"}
        </button>
      </form>

      <div className="posts-list">
        {!hasSearched && !loading && (
          <div className="post-card empty-state">
            <div className="empty-icon">🔍</div>
            <p>Enter a search term to find posts</p>
          </div>
        )}

        {hasSearched && !loading && posts.length === 0 && (
          <div className="post-card empty-state">
            <div className="empty-icon">😶</div>
            <h2>No results found</h2>
            <p>No posts matched "{query}"</p>
          </div>
        )}

        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            currentUsername={currentUsername}
            fetchPosts={refetch}
          />
        ))}
      </div>
    </div>
  );
}
