import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import Button from "../common/Button";

export default function SyncStatusBanner({ queue, syncing, isOnline, onSyncNow }) {
  const failedCount = queue.filter((e) => e.status === "failed").length;

  if (queue.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--color-awning)]/15 px-3.5 py-2.5 text-sm">
      <span className="flex items-center gap-2 text-[var(--color-awning-dark)]">
        {syncing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <CloudOff className="h-4 w-4" />
        )}
        {queue.length} {queue.length === 1 ? "sale/update" : "sales/updates"} waiting to sync
        {failedCount > 0 && ` (${failedCount} need${failedCount === 1 ? "s" : ""} retry)`}
      </span>
      {isOnline && !syncing && (
        <Button variant="ghost" onClick={onSyncNow} className="gap-1.5 !px-2.5 !py-1 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Sync now
        </Button>
      )}
    </div>
  );
}
