import { useCallback, useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { createWalkInSale } from "../services/orderService";
import { adjustStock } from "../services/productService";
import { getQueue, removeFromQueue, markQueueEntryFailed } from "../utils/offlineStore";

export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const [queue, setQueue] = useState(() => getQueue());
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const refreshQueue = useCallback(() => setQueue(getQueue()), []);

  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const pending = getQueue().filter(
        (entry) => entry.status === "pending" || entry.status === "failed"
      );
      for (const entry of pending) {
        try {
          if (entry.type === "walk_in_sale") {
            await createWalkInSale(entry.items);
          } else if (entry.type === "adjust_stock") {
            await adjustStock(entry.productId, entry.delta);
          }
          removeFromQueue(entry.id);
        } catch (err) {
          markQueueEntryFailed(entry.id, err.response?.data?.detail || "Sync failed.");
        }
        refreshQueue();
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
      refreshQueue();
    }
  }, [refreshQueue]);

  // Replay automatically the moment connectivity returns.
  useEffect(() => {
    if (isOnline) sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return { queue, syncing, sync, refreshQueue, isOnline };
}
