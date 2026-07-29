/**
 * Single source of truth for purchasable units. Mirrors the backend's
 * ProductUnit enum (values must match exactly). `allowsDecimal` units
 * (weight/volume/length) can be sold in fractions of the base amount —
 * e.g. buying 1kg from a 25kg sack. Count-based units must stay whole.
 */
export const PRODUCT_UNITS = [
  {
    value: "pc",
    fullLabel: "Piece",
    label: "pcs",
    singularLabel: "pc",
    allowsDecimal: false,
    step: 1,
  },
  {
    value: "kg",
    fullLabel: "Kilogram",
    label: "kg",
    allowsDecimal: true,
    step: 0.25,
  },
  { value: "g", fullLabel: "Gram", label: "g", allowsDecimal: true, step: 25 },
  {
    value: "L",
    fullLabel: "Liter",
    label: "L",
    allowsDecimal: true,
    step: 0.5,
  },
  {
    value: "ml",
    fullLabel: "Milliliter",
    label: "ml",
    allowsDecimal: true,
    step: 50,
  },
  {
    value: "dozen",
    fullLabel: "Dozen",
    label: "dozen",
    allowsDecimal: false,
    step: 1,
  },
  {
    value: "pack",
    fullLabel: "Pack",
    label: "packs",
    singularLabel: "pack",
    allowsDecimal: false,
    step: 1,
  },
  {
    value: "box",
    fullLabel: "Box",
    label: "boxes",
    singularLabel: "box",
    allowsDecimal: false,
    step: 1,
  },
  {
    value: "sack",
    fullLabel: "Sack",
    label: "sacks",
    singularLabel: "sack",
    allowsDecimal: false,
    step: 1,
  },
  {
    value: "bundle",
    fullLabel: "Bundle",
    label: "bundles",
    singularLabel: "bundle",
    allowsDecimal: false,
    step: 1,
  },
  {
    value: "m",
    fullLabel: "Meter",
    label: "m",
    allowsDecimal: true,
    step: 0.5,
  },
];

const UNIT_MAP = new Map(PRODUCT_UNITS.map((u) => [u.value, u]));
const DEFAULT_UNIT = PRODUCT_UNITS[0];

export function getUnitConfig(value) {
  return UNIT_MAP.get(value) || DEFAULT_UNIT;
}
