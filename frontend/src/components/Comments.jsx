import { useState, useEffect } from "react";
import { useComments } from "../hooks";
import { useConfirm } from "./ConfirmModal";
import Spinner from "./Spinner";

export default function Comments({ postId, currentUsername, postOwner, isExpanded }) {
  const { comments, loading, hasFetched, fetchComments, addComment, deleteComment } = useComments(postId);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  // Lazy-load: only fetch when first expanded
  useEffect(() => {
    if (isExpanded && !hasFetched) {
      fetchComments();
    }
  }, [isExpanded, hasFetched, fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    const success = await addComment(content.trim());
    if (success) setContent("");
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = await confirm(
      "This comment will be permanently removed and cannot be recovered.",
      { title: "Delete comment?", icon: "💬", confirmLabel: "Delete" }
    );
    if (confirmed) deleteComment(commentId);
  };

  const getInitials = (user) => (user ? user.charAt(0).toUpperCase() : "?");

  if (!isExpanded) return null;

  return (
    <>
      {ConfirmModal}
      <div className="comments-section">
        <div className="comments-wrapper">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <Spinner size={28} color="var(--primary)" />
            </div>
          ) : (
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="comments-empty">No stories shared here yet. Be the first!</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="comment-item">
                    <div className="comment-avatar">{getInitials(c.username)}</div>
                    <div className="comment-content-wrapper">
                      <div className="comment-header">
                        <span className="comment-author">@{c.username}</span>
                        {(currentUsername === c.username || currentUsername === postOwner) && (
                          <button
                            className="comment-delete-btn"
                            onClick={() => handleDeleteComment(c._id)}
                            aria-label="Delete comment"
                            title="Delete comment"
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
          )}

          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are your thoughts?"
              className="comment-input"
              disabled={submitting}
              maxLength={500}
              aria-label="Add a comment"
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting || !content.trim()}
              style={{ minWidth: "130px", justifyContent: "center" }}
            >
              {submitting ? <Spinner size={16} color="white" /> : "Post Comment"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
