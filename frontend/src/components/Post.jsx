import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Post({ post, fetchPosts }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await axios.post(`/pub/${post._id}/delete`);
      fetchPosts(); // refresh posts after deletion
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleUpdate = () => {
    navigate(`/update/${post._id}`);
  };

  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <small>@{post.username}</small>
      <br />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
