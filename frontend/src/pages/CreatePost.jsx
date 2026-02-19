import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const response = await axios.post("/pub", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201) {
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      if (err.response?.status === 401) {
        alert("You must be logged in to create a post. Please login first.");
        navigate("/login");
      } else {
        alert(err.response?.data?.error || "Failed to create post. Please try again.");
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
      }}>Create Post</h1>
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
            Upload Image (optional)
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
          {image && (
            <p style={{
              marginTop: '0.5rem',
              color: '#28a745',
              fontSize: '0.9rem'
            }}>
              Selected: {image.name}
            </p>
          )}
        </div>
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
            transition: 'background-color 0.3s',
            alignSelf: 'flex-start'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#357ABD'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4A90E2'}
        >
          Publish Post
        </button>
      </form>
    </div>
  );
}
