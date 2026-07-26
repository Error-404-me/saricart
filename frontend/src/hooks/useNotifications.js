import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../services/notificationService";

const POLL_INTERVAL_MS = 30000;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef(null);

  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
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

  async function removeNotification(id) {
    const removed = notifications.find((n) => n.id === id);
    if (!removed) return;
    const wasUnread = !removed.is_read;

    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await deleteNotification(id);
    } catch {
      // Deleting is destructive enough that a silent failure shouldn't
      // just leave it looking gone — put it back rather than resyncing
      // the whole list, so nothing else on screen shifts around.
      setNotifications((prev) =>
        prev.some((n) => n.id === id)
          ? prev
          : [...prev, removed].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at),
            ),
      );
      if (wasUnread) setUnreadCount((prev) => prev + 1);
    }
  }

  return {
    notifications,
    unreadCount,
    loaded,
    loadNotifications,
    markRead,
    markAllRead,
    removeNotification,
  };
}
