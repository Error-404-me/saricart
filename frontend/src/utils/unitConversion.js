import { getUnitConfig } from "../constants/units";

/**
 * The per-sub-unit price computed from the product's primary price and
 * its configured sub_unit_ratio — e.g. a ₱150/sack product configured
 * as "50kg per sack" resolves to ₱3.00/kg. Returns null when the owner
 * hasn't enabled selling by a smaller unit for this product.
 */
export function getSubUnitPrice(product) {
  const ratio = Number(product.sub_unit_ratio);
  if (!product.sub_unit || !ratio || ratio <= 0) return null;
  return {
    unit: product.sub_unit,
    unitPrice: Number((Number(product.price) / ratio).toFixed(2)),
  };
}

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
  const subUnitPrice = getSubUnitPrice(product);
  if (subUnitPrice && requestedUnit === subUnitPrice.unit) {
    return {
      unit: requestedUnit,
      unitPrice: subUnitPrice.unitPrice,
      ratioToSellingUnit: 1 / Number(product.sub_unit_ratio),
    };
  }
  return null;
}

/**
 * Selectable purchase units for a product — its primary unit, plus its
 * configured sub-unit if the owner enabled selling that way — each
 * carrying its own price so a customer can compare before choosing.
 */
export function getPurchaseUnitOptions(product) {
  const options = [
    {
      value: product.unit,
      label: getUnitConfig(product.unit).label,
      unitPrice: Number(product.price),
    },
  ];
  const subUnitPrice = getSubUnitPrice(product);
  if (subUnitPrice) {
    options.push({
      value: subUnitPrice.unit,
      label: getUnitConfig(subUnitPrice.unit).label,
      unitPrice: subUnitPrice.unitPrice,
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
