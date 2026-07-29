import { getUnitConfig } from "../constants/units";

/**
 * formatQuantity(1, "kg")   -> "1 kg"
 * formatQuantity(0.25, "kg") -> "0.25 kg"
 * formatQuantity(3, "pc")   -> "3 pcs"
 * formatQuantity(1, "pc")   -> "1 pc"
 */
export function formatQuantity(quantity, unit) {
  const value = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  if (Number.isNaN(value)) return "";
  const config = getUnitConfig(unit);
  const trimmed = Number(value.toFixed(3)).toString();
  const label =
    value === 1 && config.singularLabel ? config.singularLabel : config.label;
  return `${trimmed} ${label}`;
}
