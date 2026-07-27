import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  PartyPopper,
  XCircle,
} from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

const STATUS_CONFIG = {
  pending: {
    labelKey: "orderStatus.pending",
    icon: Clock,
    classes: "bg-[var(--color-awning)]/15 text-[var(--color-awning-dark)]",
  },
  accepted: {
    labelKey: "orderStatus.accepted",
    icon: CheckCircle2,
    classes: "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]",
  },
  preparing: {
    labelKey: "orderStatus.preparing",
    icon: ChefHat,
    classes: "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]",
  },
  ready: {
    labelKey: "orderStatus.ready",
    icon: PackageCheck,
    classes: "bg-[var(--color-crate)]/10 text-[var(--color-crate)]",
  },
  completed: {
    labelKey: "orderStatus.completed",
    icon: PartyPopper,
    classes: "bg-[var(--color-overlay)] text-[var(--color-muted)]",
  },
  cancelled: {
    labelKey: "orderStatus.cancelled",
    icon: XCircle,
    classes:
      "bg-[var(--color-overlay)] text-[var(--color-muted)] line-through decoration-1",
  },
};

export default function OrderStatusBadge({ status }) {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(config.labelKey)}
    </span>
  );
}
