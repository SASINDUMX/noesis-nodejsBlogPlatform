import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import Post from "../components/Post";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Spinner from "../components/Spinner";
import UserList from "../components/UserList";
import { toast } from "../utils/toast";

export default function Profile({ currentUsername }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userList, setUserList] = useState({ show: false, users: [], title: "" });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/profile/${username}`);
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setBio(res.data.user.bio || "");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("User not found.");
        navigate("/");
      } else {
        toast.error("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  }, [username, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    if (!currentUsername) {
      toast.warning("Please log in to follow users.");
      navigate("/login");
      return;
    }
    setFollowLoading(true);
    try {
      const res = await axios.post(`/profile/${username}/follow`);
      setProfile((prev) => ({
        ...prev,
        isFollowing: res.data.following,
        followerCount: res.data.followerCount,
      }));
      toast.success(res.data.following ? `Following ${username}` : `Unfollowed ${username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update follow.");
    } finally {
      setFollowLoading(false);
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
      const res = await axios.get(`/profile/${username}/${type}`);
      setUserList({
        show: true,
        users: res.data,
        title: type === "followers" ? "Followers" : "Following",
      });
    } catch (err) {
      toast.error(`Failed to fetch ${type}.`);
    }
  };

  if (loading) return (
    <div className="home-container">
      <LoadingSkeleton count={2} />
    </div>
  );

  if (!profile) return null;

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="home-container">
      {/* Profile Card */}
      <div className="post-card profile-card">
        <div className="profile-top">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`${username}'s avatar`}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            {profile.isOwnProfile && (
              <>
                <label
                  htmlFor="avatar-upload"
                  className="profile-avatar-edit"
                  title="Change avatar"
                  aria-label="Upload new avatar"
                >
                  {avatarLoading ? <Spinner size={14} color="white" /> : "✏️"}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={handleAvatarChange}
                  disabled={avatarLoading}
                />
              </>
            )}
          </div>

          {/* Info */}
          <div className="profile-info">
            <h1 className="profile-username">@{username}</h1>

            {/* Bio */}
            {profile.isOwnProfile && editingBio ? (
              <div className="profile-bio-edit">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  rows={3}
                  className="comment-input"
                  placeholder="Tell the world about yourself…"
                  style={{ resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    style={{ minWidth: "80px", justifyContent: "center" }}
                  >
                    {savingBio ? <Spinner size={14} color="white" /> : "Save"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setEditingBio(false); setBio(profile.bio || ""); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="profile-bio" onClick={() => profile.isOwnProfile && setEditingBio(true)}>
                {profile.bio || (profile.isOwnProfile ? (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic", cursor: "pointer" }}>
                    Add a bio…
                  </span>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No bio yet.</span>
                ))}
              </p>
            )}

            <p className="profile-joined">📅 Joined {joinDate}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{posts.length}</span>
            <span className="profile-stat-label">Posts</span>
          </div>
          <div className="profile-stat" onClick={() => fetchUserList("followers")} style={{ cursor: "pointer" }}>
            <span className="profile-stat-value">{profile.followerCount}</span>
            <span className="profile-stat-label">Followers</span>
          </div>
          <div className="profile-stat" onClick={() => fetchUserList("following")} style={{ cursor: "pointer" }}>
            <span className="profile-stat-value">{profile.followingCount}</span>
            <span className="profile-stat-label">Following</span>
          </div>
        </div>

        {/* Actions */}
        {!profile.isOwnProfile && currentUsername && (
          <button
            className={`btn ${profile.isFollowing ? "btn-secondary" : "btn-primary"}`}
            onClick={handleFollow}
            disabled={followLoading}
            style={{ minWidth: "130px", justifyContent: "center", marginTop: "1rem" }}
          >
            {followLoading ? (
              <Spinner size={16} color="white" />
            ) : profile.isFollowing ? (
              "✓ Following"
            ) : (
              "+ Follow"
            )}
          </button>
        )}
        {profile.isOwnProfile && (
          <Link to="/account" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
            ⚙️ Edit Account
          </Link>
        )}
      </div>

      {/* Posts */}
      <h2 style={{ margin: "2rem 0 1.5rem", fontSize: "1.4rem", color: "var(--text-muted)" }}>
        Posts by @{username}
      </h2>

      {posts.length === 0 ? (
        <div className="post-card empty-state">
          <div className="empty-icon">🖋️</div>
          <p>No posts yet.</p>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUsername={currentUsername}
              fetchPosts={fetchProfile}
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
}
