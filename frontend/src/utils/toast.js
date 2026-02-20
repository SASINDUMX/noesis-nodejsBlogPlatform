// Simple toast notification system
let toastContainer = null;

function getContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message, type = "info", duration = 3500) {
  const container = getContainer();

  const toast = document.createElement("div");
  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
  const colors = {
    success: { bg: "#0d9488", border: "#0f766e" },
    error:   { bg: "#dc2626", border: "#b91c1c" },
    warning: { bg: "#d97706", border: "#b45309" },
    info:    { bg: "#4f46e5", border: "#4338ca" },
  };

  const { bg, border } = colors[type] || colors.info;

  toast.style.cssText = `
    background: ${bg};
    border: 1px solid ${border};
    color: #fff;
    padding: 0.75rem 1.15rem;
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    pointer-events: all;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    max-width: 340px;
    word-break: break-word;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
    opacity: 0;
  `;

  toast.innerHTML = `<span style="font-size:1rem;flex-shrink:0">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
  });

  const dismiss = () => {
    toast.style.transform = "translateX(120%)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  };

  toast.addEventListener("click", dismiss);
  setTimeout(dismiss, duration);
}

export const toast = {
  success: (msg, duration) => showToast(msg, "success", duration),
  error:   (msg, duration) => showToast(msg, "error",   duration),
  warning: (msg, duration) => showToast(msg, "warning", duration),
  info:    (msg, duration) => showToast(msg, "info",    duration),
};
