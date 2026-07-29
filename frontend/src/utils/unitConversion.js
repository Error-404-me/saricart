import { getUnitConfig } from "../constants/units";

/**
 * Mirrors backend/app/services/unit_conversion.py — keep both in sync.
 * Given the unit a customer wants to transact in, returns the effective
 * unit price and the equivalent quantity-per-one in the product's
 * primary selling unit, or null if that unit isn't sold for this product.
 */
export function resolveTransactionUnit(product, requestedUnit) {
  if (requestedUnit === product.unit) {
    return {
      unit: requestedUnit,
      unitPrice: Number(product.price),
      ratioToSellingUnit: 1,
    };
  }
  if (
    product.sub_unit &&
    requestedUnit === product.sub_unit &&
    Number(product.sub_unit_ratio) > 0
  ) {
    const ratio = Number(product.sub_unit_ratio);
    return {
      unit: requestedUnit,
      unitPrice: Number((Number(product.price) / ratio).toFixed(2)),
      ratioToSellingUnit: 1 / ratio,
    };
  }
  return null;
}

/** Selectable purchase units for a product: its primary unit, plus its
 * configured sub-unit if the owner enabled selling that way. */
export function getPurchaseUnitOptions(product) {
  const options = [
    { value: product.unit, label: getUnitConfig(product.unit).label },
  ];
  if (product.sub_unit) {
    options.push({
      value: product.sub_unit,
      label: getUnitConfig(product.sub_unit).label,
    });
  }
  return options;
}

/** Max purchasable quantity expressed in `requestedUnit`. Stock is
 * always tracked in the product's primary unit. */
export function getMaxQuantityInUnit(product, requestedUnit) {
  if (requestedUnit === product.unit) return Number(product.stock);
  return Number(product.stock) * Number(product.sub_unit_ratio);
}
