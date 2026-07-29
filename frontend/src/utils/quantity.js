export function roundToStep(value, step) {
  const decimals = (String(step).split(".")[1] || "").length;
  return Number(value.toFixed(decimals));
}

export function incrementQuantity(current, step, max) {
  return Math.min(roundToStep(current + step, step), max);
}

export function decrementQuantity(current, step, min = 0) {
  return Math.max(roundToStep(current - step, step), min);
}
