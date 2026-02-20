import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "../utils/toast";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/auth/login", { username, password });
      localStorage.setItem("username", username);
      onLogin();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.status === 400
          ? err.response.data?.error || "Wrong credentials. Please try again."
          : "Login failed. Please try again.";
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
          <h2 className="home-title">Welcome Back</h2>
          <p>Enter your credentials to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="form-error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="comment-input"
              placeholder="Your username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="comment-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading || !username || !password}
          >
            {loading ? <Spinner size={18} color="white" /> : <><span aria-hidden="true">🔑</span> Sign In</>}
          </button>
        </form>

        <p className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/signup">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
