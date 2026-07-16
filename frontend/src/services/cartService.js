/**
 * The cart is purely client-side for now — there's no backend cart model.
 * It's persisted to localStorage, scoped per user, and only becomes a real
 * Order (with its own DB rows) at checkout in Phase 7.
 */
const STORAGE_PREFIX = "saricart_cart_";

function keyFor(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadCart(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(userId, items) {
  if (!userId) return;
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(items));
  } catch {
    // Storage full or unavailable — cart just won't persist this session.
  }
}

export function clearStoredCart(userId) {
  if (!userId) return;
  localStorage.removeItem(keyFor(userId));
}
