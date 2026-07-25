import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";

const POLL_INTERVAL_MS = 30000;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef(null);

  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setLoaded(true);
    } catch {
      // Silent — the bell just won't refresh this cycle.
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    intervalRef.current = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [refreshUnreadCount]);

  async function markRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // best-effort — a missed sync self-corrects on the next poll
    }
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // best-effort
    }
  }

  return { notifications, unreadCount, loaded, loadNotifications, markRead, markAllRead };
}