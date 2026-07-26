import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { updateNotificationPreferences } from "../../services/userService";

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60
        ${checked ? "bg-[var(--color-storefront)]" : "bg-[var(--color-border)]"}`}
    >
      <span
        className={`absolute flex top-1 h-5 w-5 rounded-full bg-[var(--color-surface)] shadow transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function NotificationSettings() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const push = usePushNotifications();

  async function handleToggle(key) {
    const next = {
      notify_order_updates: user?.notify_order_updates ?? true,
      notify_promotions: user?.notify_promotions ?? false,
      notify_low_stock: user?.notify_low_stock ?? true,
      [key]: !user?.[key],
    };
    setSaving(key);
    setError("");
    try {
      const updated = await updateNotificationPreferences(next);
      updateUser(updated);
    } catch {
      setError("Couldn't save that preference. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  async function handlePushToggle() {
    if (push.subscribed) {
      await push.disable();
    } else {
      await push.enable();
    }
  }

  const rows = [
    {
      key: "notify_order_updates",
      title: "Order updates",
      description:
        user?.role === "owner"
          ? "Get notified when a customer places or cancels an order."
          : "Get notified when your order's status changes.",
    },
    ...(user?.role === "owner"
      ? [
          {
            key: "notify_low_stock",
            title: "Low stock alerts",
            description:
              "Get notified when a product runs low or is about to sell out.",
          },
        ]
      : []),
    {
      key: "notify_promotions",
      title: "Product & promo updates",
      description:
        "Occasional emails about new features and offers from SariCart.",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
          <BellRing className="h-4 w-4 text-[var(--color-storefront)]" />
          Push notifications
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Get notified even you exit SariCart.
        </p>

        {push.error && (
          <p
            className="mt-4 rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
            role="alert"
          >
            {push.error}
          </p>
        )}

        {!push.supported ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Your browser doesn't support push notifications.
          </p>
        ) : push.permission === "denied" ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Notifications are blocked for this site in your browser settings.
            Enable them there, then reload this page.
          </p>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">
                {push.subscribed
                  ? "Enabled on this device"
                  : "Turn on for this device"}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                {push.subscribed
                  ? "You'll get notified on this browser."
                  : "You'll need to allow the permission prompt."}
              </p>
            </div>
            <Toggle
              checked={push.subscribed}
              onChange={handlePushToggle}
              disabled={push.loading}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
          <Bell className="h-4 w-4 text-[var(--color-storefront)]" />
          Notifications
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Choose what SariCart lets you know about.
        </p>

        {error && (
          <p
            className="mt-4 rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-3 flex flex-col divide-y divide-[var(--color-border-subtle)]">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  {row.title}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  {row.description}
                </p>
              </div>
              <Toggle
                checked={!!user?.[row.key]}
                onChange={() => handleToggle(row.key)}
                disabled={saving === row.key}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
