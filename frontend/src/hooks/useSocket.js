import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socket = null;

/**
 * useSocket — connects to the Socket.io server and registers the user.
 * Keeps a single shared socket instance across the app.
 *
 * @param {string|null} username - current logged-in username
 * @param {function} onNotification - callback fired when a notification arrives
 */
export function useSocket(username, onNotification) {
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!username) return;

    // Reuse existing socket if already connected
    if (!socket) {
      socket = io(SOCKET_URL, { withCredentials: true });
    }

    socket.emit("register", username);

    const handler = (notification) => {
      onNotificationRef.current?.(notification);
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, [username]);
}
