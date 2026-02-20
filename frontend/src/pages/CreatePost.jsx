import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "../utils/toast";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const response = await axios.post("/pub", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201) {
        toast.success("Post published!");
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      if (err.response?.status === 401) {
        toast.error("You must be logged in to create a post.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.error || "Failed to create post.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="form-page-card">
        <h1 className="form-page-title">New Post</h1>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title…"
              required
              disabled={loading}
              className="comment-input"
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-content">Content</label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here…"
              rows={10}
              required
              disabled={loading}
              className="comment-input post-textarea"
            />
          </div>

          <div className="form-group">
            <label>Image <span className="form-label-optional">(optional)</span></label>
            <div className="file-upload-zone">
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                disabled={loading}
                className="file-input"
                id="post-image"
              />
              <label htmlFor="post-image" className="file-upload-label">
                {image ? (
                  <span className="file-selected">📎 {image.name}</span>
                ) : (
                  <span>📁 Choose an image to upload</span>
                )}
              </label>
              {image && (
                <button
                  type="button"
                  className="btn btn-secondary file-clear-btn"
                  onClick={() => setImage(null)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !title.trim() || !content.trim()}
              style={{ minWidth: "150px", justifyContent: "center" }}
            >
              {loading ? <Spinner size={18} color="white" /> : <><span aria-hidden="true">✨</span> Publish Post</>}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
