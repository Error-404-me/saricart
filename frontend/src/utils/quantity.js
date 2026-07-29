/**
 * Rounds to the same decimal precision as `step`, avoiding floating point
 * drift (e.g. 0.1 + 0.2 = 0.30000000000000004) from repeated +/- clicks.
 */
export function roundToStep(value, step) {
  const decimals = (String(step).split(".")[1] || "").length;
  return Number(value.toFixed(decimals));
}

export function incrementQuantity(current, step, max) {
  return Math.min(roundToStep(current + step, step), max);
}

/**
 * No floor by default — cart decrements intentionally allow dropping to 0
 * so the item gets removed. Pass `min` to enforce a minimum orderable
 * amount (e.g. on the product page, where there's no "remove" concept).
 */
export function decrementQuantity(current, step, min = 0) {
  return Math.max(roundToStep(current - step, step), min);
}