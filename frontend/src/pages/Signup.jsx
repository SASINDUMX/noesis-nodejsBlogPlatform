import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup({ onSignup }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/auth/signup",
        { username, email, password }
      );

      localStorage.setItem("username", username);
      onSignup();
      navigate("/");

    } catch (err) {
      console.error("Signup error:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else if (err.response?.status === 500) {
        alert("Username or email already exists. Please try a different one.");
      } else {
        alert("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="home-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Join Noesis</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Start your sharing journey with us today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Username</label>
            <input
              className="comment-input"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="comment-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="comment-input"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center', height: '3.5rem' }}>
            <span>🚀</span> Create Account
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '1rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already a member? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800', marginLeft: '0.5rem' }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

