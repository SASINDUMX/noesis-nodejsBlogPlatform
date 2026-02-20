import { Link } from "react-router-dom";

const UserList = ({ users, title, onClose }) => {
    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                animation: "fadeIn 0.15s ease",
            }}
        >
            <div
                className="modal-content post-card"
                style={{
                    width: "90%",
                    maxWidth: "450px",
                    maxHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem",
                    animation: "slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="btn-link"
                        style={{ fontSize: "1.5rem", textDecoration: "none", color: "var(--text-muted)" }}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div style={{ overflowY: "auto", flex: 1, paddingRight: "0.5rem" }} className="custom-scrollbar">
                    {users.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No users found.
                        </div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.username}
                                className="comment-item"
                                style={{ marginBottom: "0.75rem", alignItems: "center", cursor: "pointer" }}
                                onClick={() => onClose()}
                            >
                                <Link to={`/profile/${user.username}`} style={{ display: "flex", gap: "1rem", width: "100%", alignItems: "center" }}>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover" }} />
                                    ) : (
                                        <div className="comment-avatar" style={{ width: "40px", height: "40px" }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, color: "var(--primary)" }}>@{user.username}</div>
                                        {user.bio && (
                                            <div
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "var(--text-muted)",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}
                                            >
                                                {user.bio}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={onClose}
                    style={{ marginTop: "1.5rem", width: "100%" }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default UserList;
