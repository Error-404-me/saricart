import { Clock, CheckCircle2, ChefHat, PackageCheck, PartyPopper, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-[var(--color-awning)]/15 text-[var(--color-awning-dark)]",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    classes: "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    classes: "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]",
  },
  ready: {
    label: "Ready for pickup",
    icon: PackageCheck,
    classes: "bg-[var(--color-crate)]/10 text-[var(--color-crate)]",
  },
  completed: {
    label: "Completed",
    icon: PartyPopper,
    classes: "bg-[var(--color-overlay)] text-[var(--color-muted)]",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-[var(--color-overlay)] text-[var(--color-muted)] line-through decoration-1",
  },
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
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
