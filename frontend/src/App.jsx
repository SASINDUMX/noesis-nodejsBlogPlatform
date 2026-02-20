import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import CreatePost from "./pages/CreatePost";
import UpdatePost from "./pages/UpdatePost";
import Search from "./pages/Search";
import Navbar from "./components/Navbar";
import "./index.css";

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("username"));
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = () => setUsername(localStorage.getItem("username"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const refreshAuth = () => setUsername(localStorage.getItem("username"));
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const isAuthenticated = !!username;

  return (
    <BrowserRouter>
      <Navbar username={username} />
      <main>
        <Routes>
          <Route path="/login" element={<Login onLogin={refreshAuth} />} />
          <Route path="/signup" element={<Signup onSignup={refreshAuth} />} />

          <Route
            path="/"
            element={isAuthenticated ? <Home currentUsername={username} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/account"
            element={
              isAuthenticated ? (
                <Account
                  currentUsername={username}
                  onLogout={refreshAuth}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/create"
            element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/update/:id"
            element={isAuthenticated ? <UpdatePost /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/search"
            element={
              isAuthenticated ? (
                <Search currentUsername={username} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
