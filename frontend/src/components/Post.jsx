import { useState, useCallback } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Comments from "./Comments";
import { useConfirm } from "./ConfirmModal";
import Spinner from "./Spinner";
import { toast } from "../utils/toast";

export default function Post({ post, currentUsername, fetchPosts }) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm(
      "This post and all its comments will be permanently removed.",
      { title: "Delete this post?", icon: "🗑️", confirmLabel: "Delete Post" }
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await axios.post(`/pub/${post._id}/delete`);
      toast.success("Post deleted successfully.");
      if (fetchPosts) fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = useCallback(() => {
    navigate(`/update/${post._id}`);
  }, [navigate, post._id]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await axios.post(`/pub/${post._id}/like`);
      setLikes(res.data.likes);
    } catch (err) {
      if (err.response?.status === 401) toast.warning("Please log in to like posts.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="post-card">
      {ConfirmModal}

      <div className="post-header">
        {/* Username links to the user's profile page */}
        <Link to={`/u/${post.username}`} className="post-username">
          @{post.username}
        </Link>
      </div>

      <h2 className="post-title">{post.title}</h2>

      {post.image && (
        <img
          src={post.image}  // Now a full Cloudinary URL, no prefix needed
          alt={`Image for post: ${post.title}`}
          className="post-image"
          loading="lazy"
        />
      )}

      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button
          className="btn btn-primary"
          onClick={handleLike}
          disabled={isLiking}
          aria-label={`Like post. Current likes: ${likes}`}
          style={{ minWidth: "110px", justifyContent: "center" }}
        >
          {isLiking ? <Spinner size={16} color="white" /> : <>❤️ {likes > 0 && <span>({likes})</span>} Like</>}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setIsCommentsExpanded((v) => !v)}
          aria-expanded={isCommentsExpanded}
          aria-controls={`comments-${post._id}`}
        >
          💬 {isCommentsExpanded ? "Hide Comments" : "Comments"}
        </button>

        {currentUsername === post.username && (
          <>
            <button className="btn btn-secondary" onClick={handleUpdate} aria-label="Edit post">
              <span aria-hidden="true">✏️</span> Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete post"
              style={{ minWidth: "100px", justifyContent: "center" }}
            >
              {isDeleting ? <Spinner size={16} color="white" /> : <><span aria-hidden="true">🗑️</span> Delete</>}
            </button>
          </>
        )}
      </div>

      <div id={`comments-${post._id}`}>
        <Comments
          postId={post._id}
          currentUsername={currentUsername}
          postOwner={post.username}
          isExpanded={isCommentsExpanded}
        />
      </div>
    </article>
  );
}
