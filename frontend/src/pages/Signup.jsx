import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "../utils/toast";

export default function Signup({ onSignup }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/signup", { username, email, password });
      localStorage.setItem("username", username);
      onSignup();
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      const message =
        err.response?.data?.message ||
        (err.response?.status === 500
          ? "Username or email already exists. Please try a different one."
          : "Signup failed. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="home-title">Join Noesis</h2>
          <p>Start your sharing journey with us today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="form-error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              className="comment-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              className="comment-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className="comment-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
              autoComplete="new-password"
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading || !username || !email || !password}
          >
            {loading
              ? <Spinner size={18} color="white" />
              : <><span aria-hidden="true">🚀</span> Create Account</>}
          </button>
        </form>

        <p className="auth-footer">
          <span>Already a member?</span>
          <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
