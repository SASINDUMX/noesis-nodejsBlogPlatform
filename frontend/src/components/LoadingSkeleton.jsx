export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="posts-list">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="post-card skeleton-card">
          <div className="skeleton" style={{ width: "80px", height: "18px", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ width: "55%", height: "28px", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ width: "100%", height: "200px", marginBottom: "1rem", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ width: "100%", height: "56px", marginBottom: "1rem" }} />
          <div className="post-actions" style={{ border: "none", padding: 0 }}>
            <div className="skeleton" style={{ width: "110px", height: "42px", borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton" style={{ width: "130px", height: "42px", borderRadius: "var(--radius-sm)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
