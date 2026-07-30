import { formatCurrency } from "../../utils/formatCurrency";
import { getUnitConfig } from "../../constants/units";
import { getSubUnitPrice } from "../../utils/unitConversion";

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-3xl",
};

/**
 * Shows a product's price per its primary unit, plus its equivalent
 * per-sub-unit price when the owner has enabled selling by a smaller
 * unit — e.g. "₱150.00/sack" with "or ₱3.00/kg" underneath — so neither
 * the customer nor the owner has to do the division in their head.
 */
export default function PriceWithUnit({
  product,
  size = "md",
  className = "",
}) {
  const subUnitPrice = getSubUnitPrice(product);

  return (
    <div className={className}>
      <p
        className={`font-display font-bold text-[var(--color-storefront)] ${SIZE_CLASSES[size]}`}
      >
        {formatCurrency(product.price)}
        <span className="ml-1 text-xs font-medium text-[var(--color-muted)]">
          /{getUnitConfig(product.unit).label}
        </span>
      </p>
      {subUnitPrice && (
        <p className="text-xs text-[var(--color-muted)]">
          or {formatCurrency(subUnitPrice.unitPrice)}/
          {getUnitConfig(subUnitPrice.unit).label}
        </p>
      )}
    </div>
  );
}
