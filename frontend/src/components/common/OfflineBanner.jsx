import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-[var(--color-awning)]/15 px-4 py-2 text-sm font-medium text-[var(--color-awning-dark)]">
      <WifiOff className="h-4 w-4 shrink-0" />
      You're offline — showing saved data. Changes you make will sync once you're back online.
    </div>
  );
}
