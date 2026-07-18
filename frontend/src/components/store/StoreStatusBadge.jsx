import { Clock, AlertCircle, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  open: {
    label: "Open",
    icon: Clock,
    classes: "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]",
  },
  closing_soon: {
    label: "Closing Soon",
    icon: AlertCircle,
    classes: "bg-[var(--color-awning)]/15 text-[var(--color-awning-dark)]",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    classes: "bg-[var(--color-overlay)] text-[var(--color-muted)]",
  },
};

export default function StoreStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.closed;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
