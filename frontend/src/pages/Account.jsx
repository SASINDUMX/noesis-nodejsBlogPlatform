import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Post from "../components/Post";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Spinner from "../components/Spinner";
import UserList from "../components/UserList";
import { usePosts } from "../hooks";
import { toast } from "../utils/toast";

const Account = ({ onLogout, currentUsername, theme, onToggleTheme }) => {
  const { posts, loading: postsLoading, refetch } = usePosts("/pub/user");
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userList, setUserList] = useState({ show: false, users: [], title: "" });
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    if (!currentUsername) return;
    setProfileLoading(true);
    try {
      const res = await axios.get(`/profile/${currentUsername}`);
      setProfile(res.data.user);
      setBio(res.data.user.bio || "");
    } catch (err) {
      toast.error("Failed to load profile info.");
    } finally {
      setProfileLoading(false);
    }
  }, [currentUsername]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.get("/auth/logout");
      localStorage.removeItem("username");
      onLogout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await axios.put("/profile/me", { bio });
      setProfile((prev) => ({ ...prev, bio }));
      setEditingBio(false);
      toast.success("Bio updated.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update bio.");
    } finally {
      setSavingBio(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarLoading(true);
    try {
      const res = await axios.post("/profile/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
      toast.success("Avatar updated.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const fetchUserList = async (type) => {
    try {
      const res = await axios.get(`/profile/${currentUsername}/${type}`);
      setUserList({
        show: true,
        users: res.data,
        title: type === "followers" ? "Followers" : "Following",
      });
    } catch (err) {
      toast.error(`Failed to fetch ${type}.`);
    }
  };

  return (
    <div className="home-container account-container">
      <div className="workspace-header">
        <h1 className="home-title">Personal Workspace</h1>

        <div className="theme-switch-container">
          <h3>Display Settings</h3>
          <button onClick={onToggleTheme} className="theme-switch-btn" aria-label="Toggle theme">
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="workspace-actions">
          <Link to="/create" className="btn btn-primary">
            <span aria-hidden="true">✨</span> New Post
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            disabled={loggingOut}
            style={{ minWidth: "120px", justifyContent: "center" }}
          >
            {loggingOut ? <Spinner size={16} /> : <><span aria-hidden="true">🚪</span> Logout</>}
          </button>
        </div>
      </div>

      {profileLoading ? (
        <LoadingSkeleton count={1} />
      ) : (
        <div className="post-card profile-card" style={{ marginBottom: "2rem" }}>
          <div className="profile-top">
            <div className="profile-avatar-wrapper">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {currentUsername?.charAt(0).toUpperCase()}
                </div>
              )}
              <label htmlFor="account-avatar-upload" className="profile-avatar-edit" title="Change avatar">
                {avatarLoading ? <Spinner size={14} color="white" /> : "✏️"}
              </label>
              <input
                id="account-avatar-upload"
                type="file"
                accept="image/*"
                className="file-input"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
              />
            </div>

            <div className="profile-info">
              <h1 className="profile-username">@{currentUsername}</h1>
              {editingBio ? (
                <div className="profile-bio-edit">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    rows={3}
                    className="comment-input"
                    style={{ resize: "vertical" }}
                  />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button className="btn btn-primary" onClick={handleSaveBio} disabled={savingBio}>
                      {savingBio ? <Spinner size={14} color="white" /> : "Save"}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingBio(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="profile-bio" onClick={() => setEditingBio(true)}>
                  {profile?.bio || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Add a bio…</span>}
                </p>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{posts.length}</span>
              <span className="profile-stat-label">Posts</span>
            </div>
            <div className="profile-stat" onClick={() => fetchUserList("followers")} style={{ cursor: "pointer" }}>
              <span className="profile-stat-value">{profile?.followerCount || 0}</span>
              <span className="profile-stat-label">Followers</span>
            </div>
            <div className="profile-stat" onClick={() => fetchUserList("following")} style={{ cursor: "pointer" }}>
              <span className="profile-stat-value">{profile?.followingCount || 0}</span>
              <span className="profile-stat-label">Following</span>
            </div>
          </div>
        </div>
      )}

      {postsLoading ? (
        <LoadingSkeleton count={2} />
      ) : posts.length === 0 ? (
        <div className="post-card empty-state">
          <div className="empty-icon">🖋️</div>
          <h2>Your workspace is ready</h2>
          <p>Unleash your creativity and share your first story with the Noesis community today.</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Start Writing
          </Link>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUsername={currentUsername}
              fetchPosts={refetch}
            />
          ))}
        </div>
      )}

      {userList.show && (
        <UserList
          title={userList.title}
          users={userList.users}
          onClose={() => setUserList({ ...userList, show: false })}
        />
      )}
    </div>
  );
};

export default Account;
