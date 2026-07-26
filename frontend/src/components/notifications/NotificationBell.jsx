import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Package,
  ClipboardList,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const ICON_BY_TYPE = {
  order_placed: ClipboardList,
  order_status_changed: Package,
  low_stock: AlertTriangle,
};

const PANEL_WIDTH = 320;
const PANEL_MARGIN = 12;

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationBell({
  variant = "full",
  collapsed = false,
}) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loaded,
    loadNotifications,
    markRead,
    markAllRead,
    removeNotification,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open && !loaded) loadNotifications();
  }, [open, loaded, loadNotifications]);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function computePosition() {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Prefer opening downward; flip upward only when there's genuinely
      // more room that way — this is what fixes a trigger pinned to the
      // bottom of the screen (desktop sidebar) or a short viewport (mobile).
      const openUpward = spaceBelow < 340 && spaceAbove > spaceBelow;

      let left = rect.right - PANEL_WIDTH;
      left = Math.max(
        PANEL_MARGIN,
        Math.min(left, window.innerWidth - PANEL_WIDTH - PANEL_MARGIN),
      );

      setCoords({
        left,
        top: openUpward ? undefined : rect.bottom + 8,
        bottom: openUpward ? window.innerHeight - rect.top + 8 : undefined,
        maxHeight: Math.max(200, (openUpward ? spaceAbove : spaceBelow) - 24),
      });
    }

    computePosition();
    window.addEventListener("resize", computePosition);
    return () => window.removeEventListener("resize", computePosition);
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        panelRef.current &&
        !panelRef.current.contains(e.target)
      ) {
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

  const isCompact = variant === "compact";

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        title={isCompact ? undefined : "Notifications"}
        className={
          isCompact
            ? "relative rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]"
            : `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium
               text-[var(--color-muted)] transition
               hover:bg-[var(--color-overlay)] hover:text-[var(--color-ink)]
               ${collapsed ? "justify-center px-2.5" : "w-full"}`
        }
      >
        <span className="relative shrink-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-crate)] px-1 text-[9px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>

        {!isCompact && (
          <span className={collapsed ? "hidden" : ""}>Notifications</span>
        )}
      </button>

      {open && coords && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            left: coords.left,
            top: coords.top,
            bottom: coords.bottom,
            width: PANEL_WIDTH,
            maxHeight: coords.maxHeight,
          }}
          className="z-50 flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl shadow-black/10"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
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

          <div className="themed-scrollbar overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                Nothing yet — you're all caught up.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
                {notifications.map((n) => {
                  const Icon = ICON_BY_TYPE[n.type] || Bell;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-2 px-4 py-3 transition hover:bg-[var(--color-overlay)]
                        ${!n.is_read ? "bg-[var(--color-storefront)]/5" : ""}`}
                    >
                      <button
                        onClick={() => handleSelect(n)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
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

                      <button
                        onClick={() => removeNotification(n.id)}
                        aria-label="Delete notification"
                        title="Delete"
                        className="mt-0.5 shrink-0 rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-crate)]/10 hover:text-[var(--color-crate)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
