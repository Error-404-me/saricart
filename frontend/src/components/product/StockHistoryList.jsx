import { useState } from "react";
import {
  PackagePlus,
  PackageMinus,
  RotateCcw,
  History,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import ComingSoon from "../common/ComingSoon";
import Button from "../common/Button";
import ConfirmModal from "../common/ConfirmModal";

const REASON_CONFIG = {
  adjustment: { label: "Manual update" },
  sale: {
    label: "Sold",
    icon: PackageMinus,
    tone: "text-[var(--color-crate)]",
  },
  cancelled: {
    label: "Order cancelled",
    icon: RotateCcw,
    tone: "text-[var(--color-storefront)]",
  },
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * onDelete(id) / onBulkDelete(ids) are async and return true on success,
 * false on failure — mirrors useNotifications' remove/removeNotifications
 * contract, so this component can manage its own select-mode state
 * without the parent needing to know about it.
 */
export default function StockHistoryList({
  entries,
  onDelete,
  onBulkDelete,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState("");

  if (entries.length === 0) {
    return (
      <ComingSoon
        icon={History}
        title="No stock changes yet"
        description="Restocks, sales, and manual adjustments will show up here."
      />
    );
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allSelected = entries.length > 0 && selectedIds.size === entries.length;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(entries.map((e) => e.id)));
  }

  function handleCancelSelect() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    const id = pendingDeleteId;
    setDeletingId(id);
    setError("");
    const ok = await onDelete(id);
    if (!ok) setError("Couldn't delete that entry. Please try again.");
    setDeletingId(null);
    setPendingDeleteId(null);
  }

  async function confirmBulkDelete() {
    const ids = [...selectedIds];
    setBulkDeleteConfirmOpen(false);
    setBulkDeleting(true);
    setError("");
    const ok = await onBulkDelete(ids);
    if (ok) {
      setSelectMode(false);
      setSelectedIds(new Set());
    } else {
      setError("Couldn't delete those entries. Please try again.");
    }
    setBulkDeleting(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        {selectMode ? (
          <p className="text-sm font-medium text-[var(--color-ink)]">
            {selectedIds.size} selected
          </p>
        ) : (
          <span />
        )}
        <button
          onClick={selectMode ? handleCancelSelect : () => setSelectMode(true)}
          className="text-xs font-medium text-[var(--color-storefront)] hover:underline"
        >
          {selectMode ? "Cancel" : "Select"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-xs text-[var(--color-crate)]"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col divide-y divide-[var(--color-border-subtle)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {entries.map((entry) => {
          const isPositive = entry.change > 0;
          const config = REASON_CONFIG[entry.reason] || {};
          const Icon = config.icon || (isPositive ? PackagePlus : PackageMinus);
          const isDeleting = deletingId === entry.id;
          const isSelected = selectedIds.has(entry.id);

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 px-4 py-3 transition ${
                selectMode && isSelected ? "bg-[var(--color-storefront)]/5" : ""
              }`}
            >
              {selectMode && (
                <button
                  onClick={() => toggleSelected(entry.id)}
                  aria-label={isSelected ? "Deselect entry" : "Select entry"}
                  className="shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4 text-[var(--color-storefront)]" />
                  ) : (
                    <Square className="h-4 w-4 text-[var(--color-muted)]" />
                  )}
                </button>
              )}

              <button
                onClick={
                  selectMode ? () => toggleSelected(entry.id) : undefined
                }
                disabled={!selectMode}
                className={`flex min-w-0 flex-1 items-center gap-3 text-left ${
                  selectMode ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`shrink-0 rounded-full p-1.5 ${
                    isPositive
                      ? "bg-[var(--color-storefront)]/10 text-[var(--color-storefront)]"
                      : "bg-[var(--color-crate)]/10 text-[var(--color-crate)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                    {entry.product_name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {config.label || "Adjusted"} ·{" "}
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-1.5">
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isPositive
                        ? "text-[var(--color-storefront)]"
                        : "text-[var(--color-crate)]"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {entry.change}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {entry.previous_stock} → {entry.new_stock}
                  </p>
                </div>

                {!selectMode && (
                  <button
                    onClick={() => setPendingDeleteId(entry.id)}
                    disabled={isDeleting}
                    aria-label={`Delete activity for ${entry.product_name}`}
                    title="Delete"
                    className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-crate)]/10 hover:text-[var(--color-crate)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectMode && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={toggleSelectAll}
            className="text-xs font-medium text-[var(--color-storefront)] hover:underline"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
          <Button
            variant="primary"
            disabled={selectedIds.size === 0}
            loading={bulkDeleting}
            onClick={() => setBulkDeleteConfirmOpen(true)}
            className="!bg-[var(--color-crate)] gap-1.5 !px-3 !py-1.5 text-xs hover:!bg-[var(--color-crate-dark)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </Button>
        </div>
      )}

      {hasMore && !selectMode && (
        <Button
          variant="ghost"
          loading={loadingMore}
          onClick={onLoadMore}
          className="w-fit self-center !px-4 !py-2 text-sm"
        >
          Show more
        </Button>
      )}

      <ConfirmModal
        open={pendingDeleteId != null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deletingId != null}
        title="Delete this activity entry?"
        confirmLabel="Delete"
      >
        <p>
          This only removes it from your activity log — it won't change your
          current stock. This can't be undone.
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDelete}
        loading={bulkDeleting}
        title={`Delete ${selectedIds.size} activity entries?`}
        confirmLabel="Delete"
      >
        <p>
          This only removes them from your activity log — it won't change your
          current stock. This can't be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}
