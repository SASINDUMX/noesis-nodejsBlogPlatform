import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import Spinner from "../components/Spinner";
import { toast } from "../utils/toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UpdatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`/pub/${id}`)
      .then((res) => {
        const post = res.data.post || res.data;
        setTitle(post.title || "");
        setContent(post.content || "");
        setExistingImage(post.image || "");
      })
      .catch((err) => {
        console.error("Error fetching post:", err);
        toast.error("Failed to load post data.");
        navigate("/account");
      })
      .finally(() => setFetchLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("removeImage", isImageRemoved);
    if (image) formData.append("image", image);

    try {
      const response = await axios.post(`/pub/${id}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("Post updated successfully!");
        navigate("/account");
      }
    } catch (err) {
      console.error("Error updating post:", err);
      if (err.response?.status === 401) {
        toast.error("You must be logged in to update a post.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.error || "Failed to update post.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="home-container" style={{ display: "flex", justifyContent: "center", paddingTop: "6rem" }}>
        <Spinner size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="form-page-card">
        <h1 className="form-page-title">Edit Post</h1>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="update-title">Title</label>
            <input
              id="update-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title"
              required
              disabled={submitLoading}
              className="comment-input"
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="update-content">Content</label>
            <textarea
              id="update-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here…"
              rows={10}
              required
              disabled={submitLoading}
              className="comment-input post-textarea"
            />
          </div>

          <div className="form-group">
            <label>Image <span className="form-label-optional">(optional)</span></label>
            <div className="file-upload-zone">
              <input
                type="file"
                id="update-image"
                onChange={(e) => { setImage(e.target.files[0]); setIsImageRemoved(false); }}
                accept="image/*"
                disabled={submitLoading}
                className="file-input"
              />
              <label htmlFor="update-image" className="file-upload-label">
                {image ? (
                  <span className="file-selected">📎 {image.name}</span>
                ) : (
                  <span>📁 Choose a new image</span>
                )}
              </label>
              {image && (
                <button type="button" className="btn btn-secondary file-clear-btn" onClick={() => setImage(null)}>
                  Remove
                </button>
              )}
            </div>

            {/* Existing image states */}
            {!image && existingImage && !isImageRemoved && (
              <div className="existing-image-wrapper">
                <p className="existing-image-label">Current image:</p>
                <div className="existing-image-row">
                  <img
                    src={`${API_BASE}/uploads/${existingImage}`}
                    alt="Current post"
                    className="existing-image-thumb"
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setIsImageRemoved(true)}
                    style={{ alignSelf: "center" }}
                  >
                    🗑️ Remove Image
                  </button>
                </div>
              </div>
            )}

            {isImageRemoved && !image && (
              <div className="remove-image-notice" role="status">
                <span>⚠️ Image will be removed on save.</span>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setIsImageRemoved(false)}
                >
                  Undo
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading || !title.trim() || !content.trim()}
              style={{ minWidth: "150px", justifyContent: "center" }}
            >
              {submitLoading ? <Spinner size={18} color="white" /> : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/account")}
              disabled={submitLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePost;
