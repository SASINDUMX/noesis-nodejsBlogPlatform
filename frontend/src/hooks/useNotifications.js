import { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import { useSocket } from "./useSocket";
import { toast } from "../utils/toast";

export function useNotifications(username) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await axios.get("/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time: prepend incoming notification from socket
  const handleIncoming = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    const icons = { like: "❤️", comment: "💬", follow: "👤" };
    toast.info(`${icons[notification.type] || "🔔"} ${notification.message}`);
  }, []);

  useSocket(username, handleIncoming);

  const markAllRead = useCallback(async () => {
    try {
      await axios.post("/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  }, []);

  return { notifications, unreadCount, loading, fetchNotifications, markAllRead };
}
