import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Package,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const ICON_BY_TYPE = {
  order_placed: ClipboardList,
  order_status_changed: Package,
  low_stock: AlertTriangle,
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loaded,
    loadNotifications,
    markRead,
    markAllRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (open && !loaded) loadNotifications();
  }, [open, loaded, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(notification) {
    if (!notification.is_read) markRead(notification.id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-crate)] px-1 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-auto top-full z-30 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
            <p className="font-display text-sm font-bold text-[var(--color-ink)]">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-[var(--color-storefront)] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                Nothing yet — you're all caught up.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
                {notifications.map((n) => {
                  const Icon = ICON_BY_TYPE[n.type] || Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleSelect(n)}
                      className={`flex items-start gap-3 px-4 py-3 text-left transition hover:bg-[var(--color-overlay)]
                        ${!n.is_read ? "bg-[var(--color-storefront)]/5" : ""}`}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                          ${
                            n.type === "low_stock"
                              ? "bg-[var(--color-crate)]/10 text-[var(--color-crate)]"
                              : "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                          }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-[var(--color-ink)]">
                            {n.title}
                          </span>
                          {!n.is_read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-storefront)]" />
                          )}
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-1 block text-[11px] text-[var(--color-muted)]">
                          {formatDate(n.created_at)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
