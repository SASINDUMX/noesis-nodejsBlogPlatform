import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export function useConfirm() {
  const [config, setConfig] = useState(null);

  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      setConfig({ message, resolve, ...options });
    });
  };

  const handleClose = (result) => {
    config?.resolve(result);
    setConfig(null);
  };

  const ConfirmModal = config
    ? createPortal(
        <div
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
          onClick={(e) => e.target === e.currentTarget && handleClose(false)}
        >
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "2rem",
              maxWidth: "380px",
              width: "90%",
              boxShadow: "var(--glass-shadow)",
              animation: "slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", textAlign: "center" }}>
              {config.icon || "🗑️"}
            </div>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.2rem",
                marginBottom: "0.75rem",
                textAlign: "center",
                color: "var(--text-main)",
              }}
            >
              {config.title || "Are you sure?"}
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                textAlign: "center",
                marginBottom: "1.75rem",
                lineHeight: 1.6,
              }}
            >
              {config.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleClose(false)}
                style={{ minWidth: "100px" }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleClose(true)}
                style={{ minWidth: "100px" }}
              >
                {config.confirmLabel || "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return { confirm, ConfirmModal };
}
