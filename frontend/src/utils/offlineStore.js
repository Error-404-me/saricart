/**
 * Offline support for the barcode scanner, scoped to what a store owner
 * actually needs mid-sale on a bad connection: look up a product by
 * barcode from the last-known catalog, and queue sales/stock changes to
 * replay once the connection comes back — rather than failing outright.
 *
 * Deliberately scoped to the scanner's two write actions (walk-in sales,
 * stock adjustments) rather than a general-purpose offline-everything
 * layer: those are the actions with clear, safe replay semantics (a delta
 * applied to stock, a sale with a fixed item list). Broader offline
 * editing (products, order status, etc.) would need real conflict
 * resolution this scope doesn't attempt.
 */

const CATALOG_KEY = "saricart_offline_catalog";
const QUEUE_KEY = "saricart_offline_queue";

// --- Product catalog cache (for offline barcode lookups) ---

export function cacheCatalog(ownerId, products) {
  try {
    localStorage.setItem(
      CATALOG_KEY,
      JSON.stringify({ ownerId, products, cachedAt: new Date().toISOString() })
    );
  } catch {
    // Storage full or unavailable — offline lookup just won't have data,
    // not worth surfacing an error to the person scanning.
  }
}

export function getCachedCatalog(ownerId) {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.ownerId === ownerId ? parsed : null;
  } catch {
    return null;
  }
}

export function findCachedProductByBarcode(ownerId, barcode) {
  const catalog = getCachedCatalog(ownerId);
  if (!catalog) return null;
  return catalog.products.find((p) => p.barcode === barcode) || null;
}

// Keep the local cache's stock numbers roughly honest between a queued
// offline sale and the next scan in the same session, so the owner isn't
// shown stock that already left the shelf a minute ago.
export function applyLocalStockDelta(ownerId, productId, delta) {
  const catalog = getCachedCatalog(ownerId);
  if (!catalog) return;
  const updated = catalog.products.map((p) =>
    p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
  );
  cacheCatalog(ownerId, updated);
}

// --- Pending action queue (replayed once back online) ---

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Best effort — if storage is unavailable there's nothing to persist.
  }
}

export function getQueue() {
  return readQueue();
}

export function enqueueAction(action) {
  const queue = readQueue();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    queuedAt: new Date().toISOString(),
    status: "pending", // pending | failed
    error: null,
    ...action,
  };
  writeQueue([...queue, entry]);
  return entry;
}

export function removeFromQueue(id) {
  writeQueue(readQueue().filter((entry) => entry.id !== id));
}

export function markQueueEntryFailed(id, error) {
  writeQueue(
    readQueue().map((entry) =>
      entry.id === id ? { ...entry, status: "failed", error } : entry
    )
  );
}
