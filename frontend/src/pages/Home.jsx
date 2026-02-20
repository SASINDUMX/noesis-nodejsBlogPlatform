import { usePosts } from "../hooks";
import Post from "../components/Post";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Home({ currentUsername }) {
  const { posts, loading, refetch } = usePosts("/pub");

  return (
    <div className="home-container">
      <h1 className="home-title">Explore Stories</h1>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : posts.length === 0 ? (
        <div className="post-card empty-state">
          <div className="empty-icon">✍️</div>
          <h2>Silence is golden… for now</h2>
          <p>Be the first to share your voice with the world.</p>
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
}
