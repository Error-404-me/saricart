// frontend/src/context/NotificationsContext.jsx (new file)
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteNotifications,
} from "../services/notificationService";

const POLL_INTERVAL_MS = 30000;
const ACTION_ERROR_MESSAGE = "Couldn't delete that. Please try again.";

export const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
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

  const clearError = useCallback(() => setError(""), []);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // best-effort — a missed sync self-corrects on the next poll
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // best-effort
    }
  }, []);

  // Returns true/false so callers know whether to close their select-mode
  // UI. Restores the optimistic update on failure instead of leaving the
  // UI silently out of sync with the server.
  const removeNotification = useCallback(
    async (id) => {
      const removed = notifications.find((n) => n.id === id);
      if (!removed) return true;
      const wasUnread = !removed.is_read;

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await deleteNotification(id);
        setError("");
        return true;
      } catch {
        setNotifications((prev) =>
          prev.some((n) => n.id === id)
            ? prev
            : [...prev, removed].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at),
              ),
        );
        if (wasUnread) setUnreadCount((prev) => prev + 1);
        setError(ACTION_ERROR_MESSAGE);
        return false;
      }
    },
    [notifications],
  );

  const removeNotifications = useCallback(
    async (ids) => {
      if (!ids || ids.length === 0) return true;
      const idSet = new Set(ids);
      const removed = notifications.filter((n) => idSet.has(n.id));
      const unreadRemovedCount = removed.filter((n) => !n.is_read).length;

      setNotifications((prev) => prev.filter((n) => !idSet.has(n.id)));
      if (unreadRemovedCount > 0) {
        setUnreadCount((prev) => Math.max(0, prev - unreadRemovedCount));
      }

      try {
        await deleteNotifications(ids);
        setError("");
        return true;
      } catch {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const restored = removed.filter((n) => !existingIds.has(n.id));
          return [...prev, ...restored].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          );
        });
        if (unreadRemovedCount > 0) {
          setUnreadCount((prev) => prev + unreadRemovedCount);
        }
        setError(ACTION_ERROR_MESSAGE);
        return false;
      }
    },
    [notifications],
  );

  const value = {
    notifications,
    unreadCount,
    loaded,
    error,
    clearError,
    loadNotifications,
    markRead,
    markAllRead,
    removeNotification,
    removeNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
