import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";

const UpdatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  useEffect(() => {
    axios.get(`/pub/${id}`).then(res => {
      const post = res.data.post || res.data;
      setTitle(post.title || "");
      setContent(post.content || "");
      setExistingImage(post.image || "");
    }).catch(err => {
      console.error("Error fetching post:", err);
      alert("Failed to load post data");
      navigate("/account");
    });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        navigate("/account");
      }
    } catch (err) {
      console.error("Error updating post:", err);
      if (err.response?.status === 401) {
        alert("You must be logged in to update a post. Please login first.");
        navigate("/login");
      } else {
        alert(err.response?.data?.error || "Failed to update post. Please try again.");
      }
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: '#333',
        textAlign: 'center'
      }}>Update Post</h1>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          required
          style={{
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here..."
          rows={8}
          required
          style={{
            padding: '0.75rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#4A90E2'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        <div style={{
          padding: '0.75rem',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Update Image (optional)
          </label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            style={{
              width: '100%',
              fontSize: '0.9rem'
            }}
          />
          {image ? (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                New image selected: {image.name}
              </p>
              <button
                type="button"
                onClick={() => setImage(null)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Change Selection
              </button>
            </div>
          ) : existingImage && !isImageRemoved ? (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Current Image:</p>
                <img
                  src={`http://localhost:5000/uploads/${existingImage}`}
                  alt="Current post"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsImageRemoved(true)}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fff',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#dc3545';
                }}
              >
                Remove Current Image
              </button>
            </div>
          ) : isImageRemoved ? (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeeba' }}>
              <p style={{ fontSize: '0.85rem', color: '#856404', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Current image will be removed on update.
                <button
                  type="button"
                  onClick={() => setIsImageRemoved(false)}
                  style={{ background: 'none', border: 'none', color: '#004085', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}
                >
                  Undo Removal
                </button>
              </p>
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#357ABD'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4A90E2'}
          >
            Update Post
          </button>
          <button
            type="button"
            onClick={() => navigate("/account")}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#f8f9fa',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e6ea'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePost;
